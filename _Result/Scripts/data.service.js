(function() {
    'use strict'
    angular
        .module('myApp')
        .factory('dataService', dataService)

    dataService.$inject = ['$http', '$q', '$rootScope']

    function dataService($http, $q, $rootScope) {
        var exception = null;
        return {
            getGoods: getGoods,
            getLast: getLast,
            search: search,
            getException: getException,
            resetException: resetException
        }

        function getGoods() {
            return http({
                method: 'GET',
                url: 'list.json'
            })
        }

        function getLast() {
            return http({
                method: 'GET',
                url: '/api/main/getLastValues'
            })
        }

        function setLast(data) {
            return http({
                method: 'PUT',
                url: 'list.json'
            })
        }

        function search(searchModel) {
            return http({
                method: 'get',
                url: '/api/main/search',
                params: searchModel
            })
        }

        function getException() {
            return http({
                    method: 'get',
                    url: '/api/admin/lastException'
                })
                .then();
        }

        function resetException() {
            $rootScope.serverException = null;
            return http({
                method: 'post',
                url: '/api/admin/resetException'
            });
        }

        //incapsuling http
        function http(data) {
            $rootScope.loading = true;

            console.log('start $http...', data);
            $rootScope.localException = null;
            return $http(data)
                .then(function(readed) {
                    console.log('load $http...', readed);
                    return readed;
                })
                .then(setThen)
                .catch(setCatch)
        }

        function setThen(readed) {
            $rootScope.loading = false;
            return readed;
        }

        function setCatch(e) {
            $rootScope.loading = false;

            console.error('dataService setCatch', e);
            $rootScope.localException = e;
            return e;
        };

    }
})();