(function() {
    'use strict';

    angular
        .module('myApp')
        .controller('ExceptionController', ExceptionController)

    ExceptionController.$inject = ['dataService'];

    function ExceptionController(dataService) {
        var vm = this;
        vm.exception = "Loading...";

        activate();

        function activate() {
            dataService
                .getException()
                .then(((readed) => {
                    if (readed != null) {
                        vm.exception = readed.data;
                        dataService
                            .resetException();
                    } else {
                        vm.exception = "Error load";
                    }
                    return readed;
                }))
        }

    }
})();