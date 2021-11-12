(function () {
    angular.module('modalInnerHTMLOkCancel', [])
        .controller('ctrModalInnerHTMLOkCancel', function ($scope, $mdDialog, $mdToast, pricingRepo, infoParams, cotizadorServ) {

            $scope.info = infoParams;
            setTimeout(function () {
                document.getElementById("information").innerHTML = $scope.info.description;
            }, 50);

            $scope.cancel = function () {
                $mdDialog.cancel('Cancelando respuesta modal');
            };

            $scope.acept = function () {
                $mdDialog.hide('Continuar respuesta ok');
            };

        });
})();