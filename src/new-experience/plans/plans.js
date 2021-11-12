(function () {
    angular.module('plans', [])
        .directive('plans', function () {
            return {
                restrict: 'E',
                templateUrl: './src/new-experience/plans/plans.html',
                controller: planesController,
                replace: true
            };
        })
        .service('planesServ', function () {
        
        });

    var planesController = ['$rootScope', '$timeout', '$scope', 'formsRepo', 'pricingRepo', 'customerServ', '$location', '$mdDialog', '$mdToast', 'configureSecureServ', 'menuExperienceServ','issueRepo', 'gaService', function ($rootScope, $timeout, $scope, formsRepo, pricingRepo, customerServ, $location, $mdDialog, $mdToast, configureSecureServ, menuExperienceServ,issueRepo, gaService) {

            $scope.showCard = {
                planes: true,
            };
            $rootScope.it = 0; //crear antes?
            $scope.planSeleccionado='';
            $scope.planesCheck=[];
            $scope.indice = null;
            console.log($rootScope.cotizacion.cotiVivienda);
            $scope.planes = $rootScope.cotizacion.cotiVivienda.detalleCotizacion;
            $scope.nuCotizacion = $rootScope.cotizacion.cotiVivienda.nuCotizacion;
            $scope.nuPlanes = $rootScope.cotizacion.cotiVivienda.detalleCotizacion.length;
            $scope.img='./assets/img/Logo_Zurich_Santander_Oficial.png';

            for (let i = 0; i < $scope.planes.length; i++) {
				let plan = $scope.planes[i];
                if(plan.cdProducto == $rootScope.cotizacion.cotiVivienda.firstPricing.cdProducto)
                {
                    plan.activo=true;
                    plan.check=false;
                    $scope.planSeleccionado=$rootScope.cotizacion.cotiVivienda.firstPricing;
                    
                }else{
                    plan.activo=false;
                    plan.check=false;
                }
          
              }
           
            $scope.showHideCard = function (card) {
                $scope.showCard[card] = !$scope.showCard[card];
            }

            $scope.volver = function () {
                gaService.enviarEvento('planes_btnCancelar');     
                $location.url('/newExperience');
                $rootScope.menu = menuExperienceServ.updateMenuOption('cotizacion');
            }
            $scope.switch = function (index) { 
                for (let i = 0; i < $scope.planes.length; i++) {
					let plan = $scope.planes[i];
                    plan.activo=false;
                    if(i==index)
                    {  
                        plan.activo=true;
                        $scope.planSeleccionado = plan;
                        $scope.indice = index;
                    }
                }
            }
            $scope.imprimir = function () {  
                if($scope.planSeleccionado!='')
                {
                    $mdToast.show($mdToast.simple().textContent("Imprimiendo...").position("bottom right"));
                    //--Imprimir cotizacion
                    issueRepo.setPrint(function (data) {}, $scope.planSeleccionado);
                    
                }else
                {
                    $mdToast.show($mdToast.simple().textContent("Debe seleccionar al menos 1 plan.").position("bottom right"));
                }
                
            }
          
            $scope.selectPlanes = function (plan,posicion) {  
             
                var index = $scope.planesCheck.indexOf(plan);
                if($scope.planesCheck.length < 3)
                {
                    if (index==-1){
                        $scope.planesCheck.push(plan);
                    }else {
                        $scope.planesCheck.splice(index, 1);
                    }
                }else{
                    
                    if (index!=-1){
                        $scope.planesCheck.splice(index, 1);

                    }else{
                        alert('Se puede comparar un maximo de 3 planes');
                        document.getElementById("check"+posicion).checked = false;
                    }
                }
                console.log($scope.planesCheck);    
            }
            $scope.confirmarCoti=function()
            {   
                gaService.enviarEvento('planes_confirmar'); 
                if($scope.indice != null)
                {
                    $rootScope.cotizacion.cotiVivienda.firstPricing = $scope.planes[$scope.indice];
                }
                $location.url('/newExperience');
                $rootScope.menu = menuExperienceServ.updateMenuOption('cotizacion');
                $rootScope.continuarOk = false;
            }
            $scope.comparar = function(){
                gaService.enviarEvento('planes_comparar');
                if ($scope.planesCheck.length < 2){
                    $mdToast.show($mdToast.simple().textContent("Debe elegir al menos 2 planes.").position("bottom right"));
                }else {
                    var request = {};
                    $scope.itemsToCompare = [];
                    var j = 0;
                    var coti=$scope.planesCheck;
                    var paso = false;
                    var index = -1;
                    for (let i = 0; i < $scope.planesCheck.length; i++){
                            request = {};
                            coti[i].image=$scope.img;
                            $scope.itemsToCompare.push(coti[i]);
                            $scope.itemsToCompare[j].cobertura = [];
                            request = {
                                cdProd: coti[i].cdProducto,
                                cdRamo: coti[i].cdRamo,
                                cdPlan: coti[i].cdPlan,
                                nuCoti: coti[i].nuCotizacion,
                                cdSuc: coti[i].cdSucursal,
                                it: $rootScope.it 
                            };
                            $scope.itemsToCompare[i].it = $rootScope.it; 
                            $rootScope.it++;
                            pricingRepo.getCoberturaNewExp(function (data) 
                                {
                                    if(data.it == $scope.itemsToCompare[j].it){ 
                                    $scope.itemsToCompare[j].cobertura = data; j++; 
                                }
                                }, request
                            );
                    };
                    console.log($scope.itemsToCompare);
                    $mdDialog.show({
                        controller: ctrModalComparar,
                        locals: {
                            dataList: $scope.itemsToCompare, 
                        },
                        templateUrl: './src/new-experience/plans/modal-comparar/modal-comparar.html',
                        clickOutsideToClose: true
                    });
                 };
            };
            function ctrModalComparar($scope, $mdDialog, dataList){
                console.log(dataList);
                $scope.dataList = dataList;
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                if ($scope.dataList.length == 2) {
                    $scope.porcent = '42';
                } else if ($scope.dataList.length == 3) {
                    $scope.porcent = '28';
                };
                $scope.autos = false;
                if(parseInt($scope.dataList[0].cdRamo) >= 30 && parseInt($scope.dataList[0].cdRamo) <= 40){ $scope.autos = true;};
            }
   
    }];
})();