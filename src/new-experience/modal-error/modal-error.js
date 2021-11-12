(function () {
    angular.module('modalError', [])
        .controller('ctrModalError', function ($scope, $mdDialog, $mdToast, pricingRepo, infoParams, cotizadorServ) {

            $scope.info = infoParams;

            if (!$scope.info.description) {
                $scope.info.description = 'Error desconocido, vuelva a intentar';
            }

            $scope.salir = function () {
                $mdDialog.hide();
            }

        });
})();