(function() {
    'use strict'
    angular
        .module('uiInputStyle', [])
        .directive('inputStyle', inputStyleDirective);

    inputStyleDirective.$inject = ['$parse']

    function inputStyleDirective($parse) {

        var directive = {
            require: '^form',
            restrict: 'A',
            link: linkFunc
        };

        return directive;

        function linkFunc(scope, element, attrs, ctrl) {
            var name = attrs['name'];
            var itemName = ctrl.$name + '.' + name;

            if (name != null) {

                var unbindMe = scope.$watch(itemName + '.$dirty', function(dirty) {
                    if (dirty) {
                        scope.$watch(itemName + '.$valid', onValidity);
                        unbindMe(); //unbind listen function
                    }
                })
            } else {
                element.on('input', onChage);
            }

            function onChage($event) {
                var item = angular.element($event.currentTarget);
                onValidity(item[0].validity.valid)
            }

            function onValidity(isValid) {
                var value = element[0].value;

                if (!isValid) {
                    element.addClass("error-input");
                } else {
                    element.removeClass("error-input");
                }
            }
        }


        // function linkFunc(scope, element, attrs, ctrl) {
        //     //var data = scope[attrs["inputStyle"]];
        //     element.on('input', onInput)
        // }

        // function onInput($event) {
        //     //event.preventDefault();
        //     var element = angular.element($event.currentTarget);
        //     var item = element[0];

        //     var valid = item.validity.valid;
        //     var value = item.value;
        //     console.warn(element);
        //     if (!valid && value != null && value.length > 0) {
        //         element.addClass("error-input");
        //     } else {
        //         element.removeClass("error-input");
        //     }
        // }

    }

})();