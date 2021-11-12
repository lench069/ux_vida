(function () {
    angular.module('cotizaciones', [])
    .directive('cotizaciones', function () {
        return {
            restrict: 'E',
            templateUrl: './src/pricing/cotizaciones/cotizaciones.html',
            controller: cotizacionesController
        };
    });

    var cotizacionesController = ['$scope', 'pricingRepo', 'issueRepo', 'cotizadorServ', 'customerServ','$mdDialog', '$mdToast', '$location', '$timeout', 'menuRamosServ','$sce', function ($scope, pricingRepo, issueRepo, cotizadorServ, customerServ,$mdDialog, $mdToast, $location, $timeout, menuRamosServ,$sce) {
    	
    	$('.loadingSVG').hide();
		$('.container-fluid').removeClass('loading');
		var userCurrent;
        $scope.getShowIncluye = function(firstPricing){
            var cdRamo = firstPricing.cdRamo;
            if ( (cdRamo >= 30 && cdRamo <= 40) && !firstPricing.nuCotizacion) {
                $scope.showDetail = false;
                return true;
            }
            $scope.showDetail = true;
            return false;
        };

        $scope.disabledButton = false;
        $scope.$watch(function(){
        	for(var i=0; i<cotizadorServ.getCotizaciones().length; i++){
        		if(cotizadorServ.getCotizaciones()[i].selCotizacion.hasOwnProperty('cdPlan') == true){ //busco al menos una que tenga cdPlan
        			return false; //desbloquea boton
        		};
        	};
            return true;
        }, function (newValue) {
        	$scope.disabledButton = newValue;
        	userCurrent = customerServ.getUser();
        });
		

        //Obtengo datos de Cotizaciones
        $scope.cotizadorServ = cotizadorServ;
		$scope.putAutoFirst = function(pred){
            var cdRamo = pred.cdRamo;
            if ( cdRamo && (cdRamo >= 30 && cdRamo <= 40) ) {
                return true;
            }
        };
        $scope.getUniqueSeguros = function (detalleCotizacion) {
            var cdSeguroList = detalleCotizacion.reduce(function (arr, item) {
                if(!(arr.indexOf(item.cdRamo)>=0)){
                    arr.push(item.cdRamo);
                }
                return arr;
            }, []);
            return cdSeguroList;
        };

        //--Personalizar
        $scope.showPersonalizarModal = function(firstPricing){
            var params = {
                cdPlan: firstPricing.cdPlan,
                cdProducto: firstPricing.cdProducto,
                cdRamo: firstPricing.cdRamo,
                cdSucursal: firstPricing.cdSucursal,
                sumaAsegurada: firstPricing.sumaAsegurada,
                nuCotizacion: firstPricing.nuCotizacion
            };
            $mdDialog.show({
                locals: {
                    coberturaRequestParams: params, 
                },
                controller: "ctrPersonalizar",
                templateUrl: './src/pricing/personalizar/personalizar.html',
                clickOutsideToClose: true
            });
        };
        
        //PopUp aviso!
        $scope.showAdvice = function(message, contractCotizacionList){
        	$mdDialog.show({
                locals: {
                    contractCotizaciones: contractCotizacionList, 
                    callback: $scope.showContract
                },
        		controller: dialogModalController,
        		templateUrl: './src/pricing/modal/modalAlertDecision.html',
        		parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen
        	});
        };
        

        //Popup Legales
        $scope.showContract = function(contractCotizaciones){
        	$mdDialog.show({
                locals: {
                    contractCotizaciones: contractCotizaciones, 
                    callback: $scope.sendCotizacion
                },
        		controller: dialogController,
        		templateUrl: './src/pricing/legales/legales.html',
        		parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen
        	});
        };
        $scope.allHaveSelectedCotizacion = function(){
            var cotizacionList = cotizadorServ.getCotizaciones(), missingSelectedCotizacionList = [];
            cotizacionList.forEach(function(item){
                if( !(item.firstPricing && item.firstPricing.cdRamo && item.firstPricing.cdPlan) && !item.cotizacionFails ){
                    missingSelectedCotizacionList.push({
                        deRamo: item.firstPricing.deRamo
                    });
                }
            });
            return missingSelectedCotizacionList;
        };
        $scope.checkContractConditions = function(){
            var cotizacionList = cotizadorServ.getCotizaciones(), contractCotizacionList = [];

            cotizacionList.forEach(function(item){
                if( (item.firstPricing && item.firstPricing.deMedidasSeg && item.firstPricing.cdPlan) ){
                	if(item.firstPricing.cdRamo === "21"){	
                		var params = {
                                cdPlan: item.firstPricing.cdPlan,
                                cdProducto: item.firstPricing.cdProducto,
                                cdRamo: item.firstPricing.cdRamo,
                                cdSucursal: item.firstPricing.cdSucursal,
                                sumaAsegurada: item.firstPricing.sumaAsegurada,
                                nuCotizacion: item.firstPricing.nuCotizacion
                        };
    	                pricingRepo.doViviendaPersonalizar(function(coberturaResponse){
    	                	console.log(coberturaResponse); 
    	                	coberturaResponse.detalleCoberturaOpcionales.forEach(function(item2){
								if(item2.cdCobertura==="037" && item2.mtSumaAsegurada != "0"){
									itemAdd={
										firstPricing: {deMedidasSeg : "<br>*POLÍTICA DE SUSCRIPCIÓN DE COBERTURA ADICIONAL DE MASCOTAS:<br><br>- La mascota debe tener entre 1 y 10 años para poder contratar esta cobertura.<br> -Esta cobertura aplica para perro o gato y los mismos no pueden ser usados para exposición y/o reproducción.<br> -Te cubre una única mascota por vigencia de póliza y no debe tener alguna enfermedad preexistente. <br>"}
									}
									contractCotizacionList.push(itemAdd);
								}
							});
    	                }, params    );
    	                contractCotizacionList.push(item);
                    }else{
                    	contractCotizacionList.push(item);
                    }
                }
            });
            return contractCotizacionList;
        };

        //--Continuar contratación
        $scope.submitPricing = function(){
            var missingCotizacionList = this.allHaveSelectedCotizacion(), message = "";
           
            if (missingCotizacionList.length){
                var ramosDesc = missingCotizacionList.map(function(a) {return a.deRamo;});
                message = ' Debe seleccionar un plan para poder continuar. (' + ramosDesc.join() + ')';
                $mdToast.show($mdToast.simple().textContent(message).position("bottom right"));
            }else{
            	var isSmartHomeCotization = this.decideNextStep();
                var contractCotizacionList = this.checkContractConditions();
                if (!contractCotizacionList.length){
                    $scope.sendCotizacion();	//No conditions, call service
                }else{
                	if(isSmartHomeCotization){
                		this.showAdvice("mensaje", contractCotizacionList);
                	}else{
                		this.showContract(contractCotizacionList);	//Must accept conditions
                	}
                }
            }
            
            if($scope.cotizadorServ.getCotizaciones()[0] != undefined){
            	var nmUsuario = $scope.cotizadorServ.getCotizaciones()[0].nmUsuario;
            	$scope.cotizadorServ.setNmUsuario(nmUsuario);
            }
        };
        $scope.decideNextStep = function(){
        	var flag = false;
            var cotizacionList = cotizadorServ.getCotizaciones(), missingSelectedCotizacionList = [];
            cotizacionList.forEach(function(item){
                if(item.firstPricing.cdRamo === "21" && (item.firstPricing.deProducto.indexOf("SMART")>1) && !item.cotizacionFails ){
                   flag = true;
                }
            });
            return flag;
        };

		$scope.showEncuestaEnri = function(enriUrlEncuesta){
	        	$mdDialog.show({
	                locals: {
						enriUrlEnc : enriUrlEncuesta,
	                    callback: function(){}
	                },
					controller: dialogEnriController,
	        		templateUrl: './src/forms/modalEncuestaEnri.html',
	        		parent: angular.element(document.body),
	                clickOutsideToClose: false,
	                fullscreen: $scope.customFullscreen
	        	});
	        };
		  	var dialogEnriController = ['$scope', '$mdDialog', 'enriUrlEnc',
					function($scope, $mdDialog,enriUrlEnc){
					$scope.hide = function () {
						$mdDialog.hide();
					};
					$scope.enriUrlEncuesta = $sce.trustAsResourceUrl(enriUrlEnc);
				}];



        $scope.sendCotizacion = function(){
			 if (userCurrent.enri.enriUseService==true){
				if (userCurrent.inCliente=='CLI'){
					if (userCurrent.cdRiesgoBSR==""){
						if (userCurrent.enri.enriPermiteContinuar==true){
							
							var dialogDesicionEnriController = ['$scope', '$mdDialog','enriUrlEncuesta','mensaje','callback', function($scope, $mdDialog, enriUrlEncuesta,mensaje,callback){
					    		$scope.hide = function () {
					                $mdDialog.hide();
					            };
 								$scope.modalAdvice = "Importante!";
					            $scope.modalMessage = mensaje;
					            $scope.avisoEnterado = function(){
					            		callback(enriUrlEncuesta);
					            	};
					        }];
							
							$mdDialog.show({
				                locals: {
				                    enriUrlEncuesta : userCurrent.enri.enriUrlEncuesta,
									mensaje: userCurrent.enri.enriMensaje,
				                    callback: $scope.showEncuestaEnri
				                },
				        		controller: dialogDesicionEnriController,
				        		templateUrl: './src/pricing/modal/modalAlertDecision.html',
				        		parent: angular.element(document.body),
				                clickOutsideToClose: true,
				                fullscreen: $scope.customFullscreen
				        	});
							return;
							
						}else{
							sendCotizacionErr(userCurrent.enri.enriMensaje);
							return;
						}

					}
				}
			}
			
			
			
	
        	$scope.cotizaciones = cotizadorServ.getCotizaciones();
        	var arraySelCotizacion = [];

        	for(var i in $scope.cotizaciones){
        		arraySelCotizacion.push($scope.cotizaciones[i].selCotizacion);
        	};

        	var promis = pricingRepo.setCotizacionSelect(arraySelCotizacion);

			promis.then(function(result){

				if(result.status == 200){
					message = result.data.mensaje;
	            	$mdToast.show($mdToast.simple().textContent(message).hideDelay(10000).position("bottom right"));
					$('.loadingSVG').show();
					$('.container-fluid').addClass('loading');
					$location.url('/issue');
				} else {
					sendCotizacionErr(result);
				}

			});
        };

		var sendCotizacionErr = function(data){

			$('#continuar').button('reset');  
			$('.cards-pricing').removeClass('loading');
			$scope.loading = false;

			if (data.data !=undefined){
			message = data.data.mensaje;
			}else{
				message = data;
			}
			
			var toast;
			var isIE = /*@cc_on!@*/false || !!document.documentMode;
			var el = angular.element(document.getElementsByClassName("barbuttons"));

			var toastChrome = $mdToast.simple()
		    .content(message)
		    //.action('OK') boton para cerrar
		    .highlightAction(true)
		    .hideDelay(6000)
		    .position('bottom right')
		    .parent(el);

			var toastIE = $mdToast.simple()
		    .content(message)
		    //.action('OK') boton para cerrar
		    .highlightAction(true)
		    .hideDelay(6000)
		    .position('bottom right');

			if(isIE){
				toast = toastIE;
			} else {
				toast = toastChrome;
			}

			$mdToast.show(toast);
		};
		
		var dialogModalController = ['$scope', '$mdDialog', 'cotizadorServ', 'contractCotizaciones', 'callback', function($scope, $mdDialog, cotizadorServ, contractCotizaciones, callback){
    		$scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.modalAdvice = "Importante!";
            $scope.modalMessage = "Seleccionaste un plan <strong>SMARTHOME</strong>, por lo que el cliente deberá comprar una cámara de monitoreo para acceder al beneficio. <br> Si eso fue lo que acordaste con el cliente, hace click en <strong>Aceptar</strong>. Sino, ofréceselo en este momento. En caso que no le interese, hace click en <strong>Cancelar</strong> para volver atrás y selecciona un plan que no sea <strong>SMARTHOME</strong>";
            $scope.contractCotizaciones = contractCotizaciones;
            $scope.avisoEnterado = function(){
            	$scope.hide();
            	$timeout(function() {
            		callback($scope.contractCotizaciones);
            	});
            };
    	}];

        var dialogController = ['$scope', '$mdDialog', 'cotizadorServ', 'contractCotizaciones', 'callback', function($scope, $mdDialog, cotizadorServ, contractCotizaciones, callback){
    		$scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.contractCotizaciones = contractCotizaciones;
            $scope.aceptarLegales = function(){
            	$scope.hide();
            	$timeout(function() {
            		callback();
            	});
            };
    	}];

        //---Coberturas
        $scope.showCoberturas = function (cotiDetalle) {
            $mdDialog.show({
                controller: coberturasController,
                templateUrl: './src/pricing/coberturas/coberturas.html',
                clickOutsideToClose: true
            });

            var cdRamo = cotiDetalle.cdRamo;

            if(cotiDetalle.cdClasifPlan == 'AUT' && cotiDetalle.cdRamo == '20'){
            	cdRamo = '18';
            }

            $mdDialog.request = {
            	cdProd: cotiDetalle.cdProducto,
                cdRamo: cdRamo,
                cdPlan: cotiDetalle.cdPlan,
                nuCoti: cotiDetalle.nuCotizacion,
                cdSuc: cotiDetalle.cdSucursal
            };
            $mdDialog.producto = {
                deProducto: cotiDetalle.deProducto,
                dePlan: cotiDetalle.dePlan
            };
        };
        var coberturasController = ['$scope', '$mdDialog', 'pricingRepo', function ($scope, $mdDialog, pricingRepo) {
            $scope.hide = function () { $mdDialog.hide();};
            $scope.producto = $mdDialog.producto;
            pricingRepo.getCobertura(function (data) { $scope.cobertura = data;}, $mdDialog.request);
        }];

        //--Imprimir cotizaciones
        var getRequest = function(coti){
        	var request = {
				nuFlota: coti.nuFlota, cdSucursal: coti.cdSucursal, nuCotizacion: coti.nuCotizacion, cdRamo: coti.cdRamo, deRamo: coti.deRamo,
				cdProducto: coti.cdProducto, deProducto: coti.deProducto, cdPlan: coti.cdPlan, dePlan: coti.dePlan, deCompania: coti.deCompania,
				mtPremio: coti.mtPremio, mtCuota: coti.mtCuota, nuPagos: coti.nuPagos, inInspeccion: coti.inInspeccion, sumaAsegurada: coti.sumaAsegurada,
				sumaGnc: coti.sumaGnc
			};
        	return request;
		};
        $scope.imprCotizaciones = function(){
        	var coti = cotizadorServ.getCotizaciones();
        	var request = {};
            for(var i in coti){
            	request = getRequest(coti[i].selCotizacion);
            	issueRepo.setPrint(function (data) {}, request);
            };
        };
        $scope.returnCoti = function(){
        	pricingRepo.doResetCotizaciones(function(data){ }, function(){});
        };
        
        $scope.delCotizacion = function(cdRamo){
			cotizadorServ.deleteCotizacion(cdRamo);
			
			var tmpRamos = menuRamosServ.getSelectedRamos();
			var index = tmpRamos.indexOf(cdRamo);
			
			if(index > -1){
				tmpRamos.splice(index, 1);
				menuRamosServ.setRamos(tmpRamos);
			}

		};

    }];
})();