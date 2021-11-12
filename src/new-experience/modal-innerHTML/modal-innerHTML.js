(function () {
    angular.module('modalInnerHTML', [])
        .controller('ctrModalInnerHTML', function ($scope, $mdDialog, $mdToast, pricingRepo, infoParams, cotizadorServ) {

            $scope.info = infoParams;

            $scope.salir = function () {
                $mdDialog.hide();
            }

            setTimeout(function () {
                document.getElementById("information").innerHTML = $scope.info.description;
            }, 50);

        });
})();