(function () {
    angular.module('modalConfirmation', [])
        .controller('ctrModalConfirmation', function ($scope, $mdDialog, $mdToast, pricingRepo, infoParams, cotizadorServ) {

            $scope.info = infoParams;

            $scope.hide = function () {
                $mdDialog.hide();
            };

            $scope.cancel = function () {
                $mdDialog.cancel('Cancelando respuesta modal');
            };

            $scope.acept = function () {
                $mdDialog.hide('Continuar respuesta ok');
            };

        });
})();