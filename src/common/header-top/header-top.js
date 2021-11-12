(function(){
    angular.module('headerTop', [])
    .directive('headerTop', function () {
        return {
            restrict: 'E',
            templateUrl: './src/common/header-top/header-top.html',
            controller: headerTopController
        };
    });
    
    var headerTopController = ['$scope', 'customerServ', 'formsRepo', 'cotizadorServ', 'formEmitServ', 'formsRepo', function($scope, customerServ, formsRepo, cotizadorServ, formEmitServ, formsRepo){
    	$scope.customerServ = customerServ;
        
    	$scope.redirect = function(){
    		if(confirm("¿Está seguro que desea salir de esta página?")){
	    		cotizadorServ.reset();
	        	formEmitServ.reset();
	        	customerServ.resetUser();
	        	formsRepo.getLogout(function (data){});
	        	sessionStorage.clear();
	    		formsRepo.getLogout(function (data){});
	    		window.location.href = window.location.origin + "/menuTree.do";
    		}
    	};
    }];
})();