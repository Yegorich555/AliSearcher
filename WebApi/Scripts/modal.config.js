angular
    .module('myApp')
    .config(modalConfig);

modalConfig.$inject = ['modalProvider'];

function modalConfig(modalProvider) {

    modalProvider.when('exceptionView', {
        templateUrl: 'exception.html',
        controller: 'ExceptionController',
        controllerAs: 'vm',
        size: 'lg'
    });
};