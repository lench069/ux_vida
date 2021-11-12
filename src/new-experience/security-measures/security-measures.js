(function () {
  angular.module('securityMeasures', [])
    .controller('securityMeasuresController', function ($scope, $mdDialog, $rootScope, formsRepo, infoParams) {

      $scope.medidasSeguridadTextArray = infoParams.split("<br>")

      $scope.continuar = function () {
        $mdDialog.hide('Continuar respuesta ok');
      }

      $scope.hide = function () {
        $mdDialog.cancel('Cancelando respuesta modal');
      }

    });

})();