(function() {
    'use strict'
    angular
        .module('myApp')
        .controller('SearchController', SearchController);

    SearchController.$inject = ['dataService', '$scope', '$timeout', 'modalService'];

    function SearchController(dataService, $scope, $timeout, modalService) {
        var vm = this;
        $scope.Math = window.Math;
        vm.enumShipCountry = {
            BY: 'Belarus',
            RU: 'Russian Federation',
        }

        vm.enumCurrency = {
            USD: '$',
            RUB: '₽',
            EUR: '€'
        }

        vm.enumSort = [
            'Price: min to max',
            'Price: max to min',
            'Price by lot size: min to max',
            'Price by lot size: max to min',
            'Seller raiting: max to min',
            'Seller raiting: min to max',
            'Count orders: max to min',
            'Count orders: min to max'
        ]

        vm.goods = null;
        vm.research = research;
        vm.searchResult = null;
        vm.loadNextPage = loadNextPage;
        vm.canceled = false;
        vm.scrollingDisable = true;
        vm.totalCount = null;
        vm.totalPages = 0;

        vm.sm = {
            sortMode: 0,
            currency: "USD",
            shipCountry: "BY",
            aliMinPrice: 0,
            aliMaxPrice: 20
        };
        vm.currency;
        vm.patternPrice = "[0-9]*[.,]?[0-9]+"
        vm.patternLotSize = "[0-9]*";
        vm.searchIsVisible = true;
        vm.exceptionExist = false;

        activate();

        function activate() {
            $scope.$watch('vm.sm.currency', () => { vm.currency = vm.enumCurrency[vm.sm.currency] });
            vm.currency = vm.enumCurrency[vm.sm.currency];

            dataService
                .getLast()
                .then(function(readed) {
                    if (readed != null && readed.data != null) {
                        let data = readed.data;
                        vm.exceptionExist = data.exceptionExist;
                        if (data.model != null) {
                            vm.sm = data.model;
                            vm.sm.aliMaxPrice = parseFloatNull(vm.sm.aliMaxPrice);
                            vm.sm.aliMinPrice = parseFloatNull(vm.sm.aliMinPrice);
                            vm.sm.resMaxPrice = parseFloatNull(vm.sm.resMaxPrice);
                            vm.sm.resMinPrice = parseFloatNull(vm.sm.resMinPrice);
                        }
                    }
                })
                .then(activateAfter);
        }

        function parseFloatNull(value) {
            if (value == null) {
                return 0;
            }
            return parseFloat(value);
        }

        var promise;

        function stopWaitSearch() {
            if (promise != null) {
                $timeout.cancel(promise);
            }
        }

        function research() {
            loadNextPage = false;
            vm.goods = null;
            vm.totalCount = null;
            vm.totalPages = 0;
            vm.sm.page = 1;
            vm.smSubmit = angular.copy(vm.sm);
            // console.warn(vm.sm.page, vm.smSubmit);
            vm.smSubmit.aliSearchHist = null;
            stopWaitSearch();

            search();
        }

        function search() {
            dataService
                .search(vm.smSubmit)
                .then(readResponseSearch)
        }

        function readResponseSearch(readed) {
            if (readed.data == null) {
                vm.searchResult = null;
                return;
            }
            vm.canceled = readed.data.canceled;

            if (vm.canceled === false) {
                vm.loadingLock = true;
                promise = $timeout(search, 1000);
            } else {
                vm.loadingLock = false;
                let goods = readed.data.goods;
                vm.loadingPage = true;

                if (goods != null) {
                    // console.info('we getted next page', vm.smSubmit, vm.smSubmit.page);
                    ++vm.smSubmit.page;
                }
                vm.goods == null ? vm.goods = goods : vm.goods.extend(goods);

                vm.loadingPage = false;

                vm.totalCount = readed.data.totalCount;
                vm.totalPages = readed.data.totalPages;
                vm.exceptionExist = readed.data.exceptionExist;
                vm.sm.aliSearchHist = readed.data.aliSearchHist;
            }

            vm.searchResult = readed.data.searchStatus;
        }

        function loadNextPage() {
            if (vm.smSubmit.page <= vm.totalPages) {
                search();
            }
        };

        function activateAfter() {
            research();
        }
    }
})();