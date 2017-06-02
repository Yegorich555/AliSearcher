(function() {
    'use strict'
    angular
        .module('uiConfirm', [
            "ngAnimate",
            'ui.bootstrap'
        ])
        .provider('uiConfirmProvider', uiConfirmProvider)
        .factory('uiConfirm', uiConfirm)
        .controller('ConfirmController', ConfirmController);

    function uiConfirmProvider() {
        this.$get = get;
        this.setOptions = setOptions;

        function get() {
            return {
                options: optionsModal,
            }
        }

        var optionsModal = {
            size: 'sm'
        };

        function setOptions(options) {
            optionsModal = options;
        }
    }

    uiConfirm.$inject = ['$uibModal', 'uiConfirmProvider']

    function uiConfirm($uibModal, uiConfirmProvider) {
        var service = {
            showModal: showModal,
        }
        return service;

        function showModal(options, optionsModal) {
            if (optionsModal == null) {
                optionsModal = uiConfirmProvider.options;
            }
            var params = angular.extend({
                template: modalTemplate,
                controller: "ConfirmController",
                controllerAs: "vm",
                resolve: {
                    options: options,
                }
            }, optionsModal)
            var inst = $uibModal.open(params);

            return inst.result;
        }
    }

    ConfirmController.$inject = ['$uibModalInstance', 'options'];

    function ConfirmController($uibModalInstance, options) {
        var vm = this;

        vm.message = "Set any text in options.message";
        vm.textYes = "Yes";
        vm.textNo = "No";
        vm.yes = yes;
        vm.no = no;

        activate();

        function activate() {
            if (options == null) {
                return;
            }
            if (options.message != null) {
                vm.message = options.message;
            }
            if (options.textYes != null) {
                vm.textYes = options.textYes;
            }
            if (options.textNo != null) {
                vm.textNo = options.textNo;
            }
        }


        function yes() {
            return $uibModalInstance.close(true);
        }

        function no() {
            return $uibModalInstance.close(false);
        }
    }

    const modalTemplate = `
            <div class="modal-content">         
                <div class="modal-body" style="text-align:center">
                      {{vm.message}}
                </div>
 
                <div class="modal-footer">
                    <button class="btn btn-primary pull-left" ng-click="vm.yes()">
                         {{vm.textYes}}
                    </button>
                    <button class="btn btn-primary" ng-click="vm.no()">
                        {{vm.textNo}}
                    </button>
                </div>
            </div>
    `;

})();