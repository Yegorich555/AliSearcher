(function() {
    'use strict'
    angular
        .module('uiHideZero', [])
        .directive('hideZero', directive);

    function directive() {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function(scope, element, attrs, ngModel) {
                element.on('blur', onChange);

                function onChange() {
                    if (ngModel.$viewValue == 0) {
                        // ngModel.$viewValue = '';
                        ngModel.$setViewValue('');
                        ngModel.$render();
                    }
                }
                ngModel.$formatters.push(function(inputValue) {
                    if (inputValue == 0) {
                        return '';
                    }
                    return inputValue;
                });
                // ngModel.$parsers.push(function(inputValue) {
                //     if (inputValue == 0) {
                //         ngModel.$setViewValue('');
                //         ngModel.$render();
                //     }
                //     return inputValue;
                // });
            }
        };

    }
})();