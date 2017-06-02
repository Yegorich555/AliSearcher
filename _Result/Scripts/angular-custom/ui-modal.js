(function() {
    'use strict'
    angular
        .module('uiModal', [
            "ngAnimate",
            'ui.bootstrap'
        ])
        .provider('modal', modalProvider)
        .factory('modalService', modalService)
        .directive('modal', modalDirective);

    function modalProvider() {
        this.$get = get;
        this.when = when;

        function get() {
            return {
                routes: routes,
            }
        }

        var routes = {};

        function when(path, options) {
            routes[path] = options;
        }
    }

    modalDirective.$inject = ['modalService', '$parse'];

    function modalDirective(modalService, $parse) {

        var directive = {
            restrict: 'A',
            link: linkFunc
        };

        return directive;

        function linkFunc(scope, element, attrs, ctrl) {
            var path = attrs.modal;
            var attrKey = attrs.modalResolve;

            element.on('click', function($event) {
                var item;
                if (attrKey != null) {
                    item = $parse(attrKey)(scope);
                }
                modalService.open(path, item);
            })
        }
    }

    modalService.$inject = ['$uibModal', 'modal'];

    function modalService($uibModal, modalProvider) {
        return {
            open: open,
            close: close
        }

        var instance;

        function open(path, item) {
            if (path != null) {
                var options = modalProvider.routes[path];
                if (options == null) {
                    console.error("Error modalService.open(). modalProvider not contained route with path='" + path + "'");
                    return;
                }
                if (angular.isDefined(item)) {
                    options.resolve = { item: item };
                }
                instance = $uibModal
                    .open(options);
            }
        }

        function close(result) {
            if (instance != null) {
                return instance.close(result);
            }
        }

    }
})();