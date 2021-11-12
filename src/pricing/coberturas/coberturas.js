(function(){
    angular.module('coberturas', [])
    .directive('coberturas', function(){
        return {
            restrict: 'E',
            templateUrl: './src/pricing/coberturas/coberturas.html',
            controller: coberturasController
        };
    });

    var coberturasController = ['$scope', function($scope){
    }];
})();