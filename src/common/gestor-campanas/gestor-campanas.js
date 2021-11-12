(function () {
    angular.module('gestorCampanas', [])
    .directive('gestorCampanas', function () {
        return {
            restrict: 'E',
            templateUrl: './src/common/gestor-campanas/gestor-campanas.html',
            controller: gestorCampanasController
        };
    });

    var gestorCampanasController = ['$scope', 'commonRepo', 'customerServ', '$sce', function ($scope, commonRepo, customerServ, $sce) {
    	
    	var clientSessionInitiated = false;
    	$scope.showCard = false;
    	$scope.$watch(
    			function(){ return customerServ.getUser();}, 
    			function (newValue) {
		            if (!$.isEmptyObject(newValue) && !clientSessionInitiated){
		                clientSessionInitiated = true;
		                commonRepo.getMensajeComercial(function(data){ $scope.mensajeCom = data;});
		                $scope.showCard = true;
		            };
		        }
    			);

        $scope.hideCard = function(){
            $scope.showCard = false;
        };
        
        $scope.renderHtml = function(html_string){
        	return $sce.trustAsHtml(html_string);
        };
    }];
})();