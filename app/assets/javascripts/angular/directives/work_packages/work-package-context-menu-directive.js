angular.module('openproject.workPackages.directives')

.directive('workPackageContextMenu', [
  'ContextMenuService',
  'WorkPackagesTableHelper',
  'WorkPackageContextMenuHelper',
  'WorkPackageService',
  'WorkPackagesTableService',
  'I18n',
  '$window',
  function(ContextMenuService, WorkPackagesTableHelper, WorkPackageContextMenuHelper, WorkPackageService, WorkPackagesTableService, I18n, $window) {
  return {
    restrict: 'EA',
    replace: true,
    scope: {},
    templateUrl: '/templates/work_packages/work_package_context_menu.html',
    link: function(scope, element, attrs) {
      var contextMenuName = 'workPackageContextMenu';

      scope.I18n = I18n;

      scope.hideResourceActions = true;

      // wire up context menu event handler
      ContextMenuService.registerMenuElement(contextMenuName, element);
      scope.contextMenu = ContextMenuService.getContextMenu();

      scope.$watch('contextMenu.opened', function(opened) {
        scope.opened = opened && scope.contextMenu.targetMenu === contextMenuName;
      });
      scope.$watch('contextMenu.targetMenu', function(target) {
        scope.opened = scope.contextMenu.opened && target === contextMenuName;
      });

      scope.$watch('contextMenu.context.row', function(row) {
        if (row && scope.contextMenu.targetMenu === contextMenuName) {
          updateContextMenu(getWorkPackagesFromContext(scope.contextMenu.context));
        }
      });

      scope.triggerContextMenuAction = function(action, link) {
        if (action === 'delete') {
          deleteSelectedWorkPackages();
        } else {
          $window.location.href = link;
        }
      };

      function deleteSelectedWorkPackages() {
        if (!deleteConfirmed()) return;

        var rows = WorkPackagesTableHelper.getSelectedRows(scope.contextMenu.context.rows);

        WorkPackageService.performBulkDelete(getWorkPackagesFromContext(scope.contextMenu.context))
          .success(function(data, status) {
            // TODO wire up to API and processs API response
            scope.$emit('flashMessage', {
              isError: false,
              text: I18n.t('js.work_packages.message_successful_bulk_delete')
            });

            WorkPackagesTableService.removeRows(rows);
          })
          .error(function(data, status) {
            // TODO wire up to API and processs API response
            scope.$emit('flashMessage', {
              isError: true,
              text: I18n.t('js.work_packages.message_error_during_bulk_delete')
            });
          });
      }

      function deleteConfirmed() {
        return $window.confirm(I18n.t('js.text_work_packages_destroy_confirmation'));
      }

      function updateContextMenu(workPackages) {
        scope.permittedActions = WorkPackageContextMenuHelper.getPermittedActions(workPackages);
      }

      function getWorkPackagesFromSelectedRows(rows) {
        var selectedRows = WorkPackagesTableHelper.getSelectedRows(rows);

        return WorkPackagesTableHelper.getWorkPackagesFromRows(selectedRows);
      }

      function getWorkPackagesFromContext(context) {
        if (!context.row) return [];

        context.row.checked = true;

        var workPackagefromContext = context.row.object;
        var workPackagesfromSelectedRows = getWorkPackagesFromSelectedRows(context.rows);

        if (workPackagesfromSelectedRows.length === 0) {
          return [workPackagefromContext];
        } else if (workPackagesfromSelectedRows.indexOf(workPackagefromContext) === -1) {
          return [workPackagefromContext].concat(workPackagesfromSelectedRows);
        } else {
          return workPackagesfromSelectedRows;
        }
      }

    }
  };
}]);