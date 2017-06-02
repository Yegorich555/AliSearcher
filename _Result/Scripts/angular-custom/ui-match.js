(function() {
    'use strict'
    angular
        .module('uiMatch', [])
        .directive('match', matchDirective);

    matchDirective.$inject = ['$parse']

    function matchDirective($parse) {
        return {
            require: '^form',
            restrict: 'A',
            link: link,
        }

        function link(scope, elem, attrs, ctrl) {
            if (!ctrl || !attrs.match || !attrs.ngModel) {
                return;
            }
            var v1 = attrs.match;
            var v2 = attrs.ngModel;

            // watch own value and re-validate on change
            scope.$watch(v1, function() {
                validate();
            });

            scope.$watch(v2, function() {
                validate();
            });

            function validate() {
                var val1 = $parse(v1)(scope);
                var val2 = $parse(v2)(scope);
                if (val1 != null && val2 != null) {
                    var itemName = ctrl.$name + '.' + attrs['name']; //todo: to use without 'name'
                    var item = $parse(itemName)(scope);
                    console.info('>>', elem);
                    item.$setValidity('match', val1 == val2);
                }
            }
        }
    }
})();