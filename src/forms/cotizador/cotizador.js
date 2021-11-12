(function(){
    angular.module('cotizador', [])
    .directive('cotizador', function(){
        return {
            restrict: 'E',
            templateUrl: './src/forms/cotizador/cotizador.html',
            controller: cotizadorController,
            replace: true
        };
    })
    .service('cotizadorServ', function(){
    	var ret = function () { };
        var cotizaciones = [];
        var form = { cotiVivienda: {}, cotiCompraprot: {}, cotiAuto: {}};
        var sessionIni = false;
        var nmUsuario = "";
        var cdCanalBco = "";
        var actividadesNoAseguradas = "Ninguna.";
        
        ret.setActividadesNoAseguradas = function(data){
        	actividadesNoAseguradas = data; 
        };
        ret.getActividadesNoAseguradas = function(){
        	return actividadesNoAseguradas; 
        };
        ret.setCdCanalBco = function(data){
        	cdCanalBco = data; 
        };
        ret.getCdCanalBco = function(){
        	return cdCanalBco; 
        };
        ret.setNmUsuario = function(data){
        	nmUsuario = data; 
        };
        ret.getNmUsuario = function(){
        	return nmUsuario; 
        };
        ret.setSessionIni = function(data){
        	sessionIni = data; 
        };
        ret.getSessionIni = function(){
        	return sessionIni; 
        };
        ret.setForm = function(data){
        	form = data; 
        };
        ret.getForm = function(){
        	return form; 
        };
        ret.resetForm = function(){
        	form = { cotiVivienda: {}, cotiCompraprot: {}, cotiAuto: {}};
        };
        ret.setCotizaciones = function(data){
        	data.selCotizacion = data.firstPricing; 
        	cotizaciones.push(data);
        };
        ret.realSetCotizaciones = function(data){ 
        	cotizaciones = data;
        };
        ret.getCotizaciones = function(){
        	return cotizaciones;
        };
        ret.getCotizacionByCdRamo = function(cdRamo){
            var coti = {};
            cotizaciones.forEach(function (item) {
                if (item.cdRamo == cdRamo){
                    coti = item;
                }
            });
            return coti;
        };
        ret.reset = function(){
        	cotizaciones = [];
        };
        ret.deleteCotizacion = function(cdRamo){
        	
        	cotizaciones = $.grep(cotizaciones, function(obj, i){
        	  return obj.cdRamo != cdRamo;
        	});
        	
        	if(parseInt(cdRamo) >= 30 && parseInt(cdRamo) <= 40){
        		auxCdRamo = 40;
        		
        		cotizaciones = $.grep(cotizaciones, function(obj, i){
              	  return obj.cdRamo != auxCdRamo;
              	});
        	}

        };
        ret.updateFirstPricing = function(keys){
        	var detalle = [];
        	var newDetalle = {};
        	cotizaciones = $.grep(cotizaciones, function(obj, i){
        		var indexNewDetalle = -1;
        		if(obj.cdRamo == keys.cdRamo){
        			detalle = obj.detalleCotizacion;
        			for(var j=0; j < detalle.length; j++){
        				if(detalle[j].cdProducto == keys.cdProducto && detalle[j].cdPlan == keys.cdPlan){
        					newDetalle = detalle[j];
        					indexNewDetalle = i;
        					break;
        				}
        			};
        		}
        		if(indexNewDetalle != -1){
        			cotizaciones[indexNewDetalle].firstPricing = newDetalle;
        			cotizaciones[indexNewDetalle].selCotizacion = newDetalle;
        		}
        		return obj;
        	});
        };
        ret.updateCotizacion = function(cdRamo, newCotizacion){
            cotizaciones.forEach(function (item, i) {
                if (item.cdRamo == cdRamo){
                    cotizaciones[i] = newCotizacion;
                    cotizaciones[i].selCotizacion = cotizaciones[i].firstPricing;
                }
            });
        };
        ret.getCostos = function(){
        	var total = 0;
        	var totalDiario = 0;
            cotizaciones.forEach(function (item) {
            	if(item.selCotizacion.hasOwnProperty('mtCuota')){
            		total += parseFloat(item.selCotizacion.mtCuota);
            	};
            });
            totalDiario = total / parseFloat(30);
            return {total: total, totalDiario: totalDiario};
        };

		ret.verificoActividadesNoAseguradas = function(selectedRamo) {
			var auto = form.cotiAuto;
			if(auto.inAutoMoto == 'M' && auto.cdUso == '2' && selectedRamo == '34'){
				if(!confirm("Las actividades listada a continuación NO serán aseguradas:\n" + actividadesNoAseguradas)){
					return true;
				}
			}
			return false;
		}
        
        return ret;
    });

    var cotizadorController = ['$scope', '$rootScope', 'formsRepo', '$location', 'cotizadorServ', 'pricingRepo', 'customerServ', 'truncateAtCharFilter', 'menuRamosServ', 'ramosListSharedData','$mdDialog', 'configureSecureServ', function ($scope, $rootScope, formsRepo, $location, cotizadorServ, pricingRepo, customerServ, truncateAtCharFilter, menuRamosServ, ramosListSharedData, $mdDialog, configureSecureServ) {
        $scope.errorForm = false;
    	cotizadorServ.reset();
    	sessionStorage.clear();
		$scope.dataUserSuc = ($rootScope.cotizacion && $rootScope.cotizacion.dataUserSuc) ? $rootScope.cotizacion.dataUserSuc : {};
		$scope.showNewExperience = false;
    	
        $scope.form = { cotiVivienda: {}, cotiCompraprot: {}, cotiAuto: {}};
        var oldForm = cotizadorServ.getForm();
        var tmpRamos = [];
        
        if(oldForm != undefined){
        	$scope.form = oldForm;
        }
        
    	$scope.userCurrent = {};
    	$scope.provincias = customerServ.getProvincias();
    	$scope.provinciasAut = customerServ.getProvinciasAut();
    	$scope.localidades = customerServ.getLocalidades();
    	$scope.localidadesAut = customerServ.getLocalidadesAut();
    	
		browser = GetBrowser();

    	//Watcher 
        $scope.$watch(function(){
            return customerServ.getUser();
            
        }, function (newValue) {
        	
        	$scope.form = cotizadorServ.getForm();
            
            $scope.userCurrent = newValue;
            var isSession = cotizadorServ.getSessionIni();
            
            if($scope.userCurrent.nuDoc == undefined){
            	return;
            };
            
            $scope.form.cotiCompraprot.tempFeNac = $scope.userCurrent && moment($scope.userCurrent.feNac).toDate();
            
            if (!$.isEmptyObject(newValue) && !isSession){
            	
            	cotizadorServ.setSessionIni(true);
            	$scope.getLimitData();
                
                //vivienda y auto
            	$scope.form.cotiVivienda.tpCobertura = $scope.form.cotiVivienda.tpCobertura || '1';
            	$scope.form.cotiVivienda.cdClaseRiesgo = $scope.form.cotiVivienda.cdClaseRiesgo || 'PER';

            	$scope.form.cotiAuto.inAutoMoto = $scope.form.cotiAuto.inAutoMoto || 'A';
            	$scope.form.cotiAuto.in0km = $scope.form.cotiAuto.in0km || 'N';
            	
            	if($scope.form.cotiAuto.in0km != 'N'){
            		var year = new Date();
            		$scope.form.cotiAuto.nuAnio = year.getFullYear();
            	}else{
            		$scope.form.cotiAuto.nuAnio = $scope.form.cotiAuto.nuAnio || undefined;
            	};
            	
            	$scope.form.cotiAuto.tpGnc = $scope.form.cotiAuto.tpGnc || 'N|0|0';
            	$scope.form.cotiAuto.mtSumaGnc = $scope.form.cotiAuto.mtSumaGnc || null;
            	$scope.form.cotiAuto.cdUso = $scope.form.cotiAuto.cdUso || '1';
            	$scope.form.cotiAuto.tpIva = $scope.form.cotiAuto.tpIva || 'CF';
            	$scope.form.cotiAuto.tpCobertura = $scope.form.cotiAuto.tpCobertura || 'TODAS';
            	$scope.form.cotiAuto.inGarage = $scope.form.cotiAuto.inGarage || 'N';
            	$scope.form.cotiAuto.inRastreador = $scope.form.cotiAuto.inRastreador || 'N';
            	$scope.form.cotiAuto.cdRamo = $scope.form.cotiAuto.cdRamo || '40';
            	$scope.form.cotiAuto.roboEnContenido = $scope.form.cotiAuto.roboEnContenido || 'no';
            	$scope.form.cotiAuto.mtSumaRobo = $scope.form.cotiAuto.mtSumaRobo || null;

                formsRepo.getAllProvincias(function (data) { 
                	$scope.provincias = data;
                	$scope.provinciasAut = data;
                	customerServ.setProvincias(data);
                	configureSecureServ.setProvincias(data);
                	customerServ.setProvinciasAut(data);
                	
                	if($scope.userCurrent.cdProvincia != undefined){
        	        	$scope.form.cotiVivienda.cdProvincia = $scope.userCurrent.cdProvincia;
    	        		$scope.searchProv = $scope.userCurrent.deProvincia;
    	        		$scope.form.cotiVivienda.deProvincia = $scope.userCurrent.deProvincia;
    	        		
    	        		$scope.form.cotiAuto.cdProvincia = $scope.userCurrent.cdProvincia;
    	        		$scope.searchProvAut = $scope.userCurrent.deProvincia;
    	        		$scope.form.cotiAuto.deProvincia = $scope.userCurrent.deProvincia;
        	        	
        	        	formsRepo.getLocalidadesByProv(function (data) {
        	        		$scope.localidades = data;
        	        		$scope.localidadesAut = data;
        	        		customerServ.setLocalidades(data);
        	        		configureSecureServ.setLocalidades(data);
        	            	customerServ.setLocalidadesAut(data);
        	        		
        	        		if($scope.userCurrent.cdCiudad != undefined){
        	        			$scope.selectedItemChange($scope.userCurrent.cdCiudad + '|' + $scope.userCurrent.cdPostal , 'cotiVivienda', 'codPos');
        	        			$scope.searchLocalidad = $scope.userCurrent.deCiudad + '(' + $scope.userCurrent.cdPostal+ ')';
        	        			$scope.form.cotiVivienda.deLocalidad = $scope.userCurrent.deCiudad + '(' + $scope.userCurrent.cdPostal+ ')';
        	        			
        	        			$scope.selectedItemChange($scope.userCurrent.cdCiudad + '|' + $scope.userCurrent.cdPostal, 'cotiAuto', 'cdPosAuto');
        	        			$scope.searchLocalidadAut = $scope.userCurrent.deCiudad + '(' + $scope.userCurrent.cdPostal+ ')';
        	        			$scope.form.cotiAuto.deLocalidad = $scope.userCurrent.deCiudad + '(' + $scope.userCurrent.cdPostal+ ')';
        	        		};
        	        	}, $scope.userCurrent.cdProvincia);
                	};
                });
            }
            
        	if($scope.form.cotiAuto.inAutoMoto && $scope.form.cotiAuto.nuAnio){
        		formsRepo.getCarBrands(function (data) { $scope.carBrands = data; }, $scope.form.cotiAuto.inAutoMoto, $scope.form.cotiAuto.nuAnio);
    		}
        	if($scope.form.cotiAuto.nuAnio && $scope.form.cotiAuto.cdMarca){
        		formsRepo.getCarModels(function (data) { $scope.carModels = data; }, $scope.form.cotiAuto.cdMarca, $scope.form.cotiAuto.nuAnio);
    		}

    		cotizadorServ.setForm($scope.form);
            
        });
        $scope.existsAnySelection2 = false;
		$scope.ramosSelection = ramosListSharedData.ramosListMap;
		
		formsRepo.getRamosNoPermitidos(function (data) {
        	$scope.ramosNoPermitidos = data; 
        });
		
		formsRepo.getMotoActividadesComercialesNoAseguradas(function (data) {
        	cotizadorServ.setActividadesNoAseguradas(data); 
        });
        
        $scope.$watch(function(){
            return menuRamosServ.ramos;
        }, function(modifiedRamosList){
			$scope.showNewExperience = false;
			var ramos = '';
			$scope.existsAnySelection2 = Object.keys(modifiedRamosList).some(function(k){ return modifiedRamosList[k].selected; });

			for (let i = 0 ; i < modifiedRamosList.length; i++) {
				let ramo = modifiedRamosList[i];
				if (ramo && ramo.selected && ramo.available) {
					ramos += ramo.cdRamo + ',';
				}
			}

			ramos = ramos.slice(0, -1);
			if ($rootScope.cotizacion && $rootScope.cotizacion.listaSeguros){ 
				$rootScope.cotizacion.listaSeguros = ramos.split(','); 
			}
			
			if ($rootScope.cotizacion) {
				$rootScope.cotizacion.ramos = ramos;
			}

			if ($rootScope.cotizacion && $rootScope.cotizacion.dataUserSuc && $rootScope.cotizacion.dataUserSuc.cdSucursalCapj) {
				var params = {
					cdSuc: $rootScope.cotizacion.dataUserSuc.cdSucursalCapj,
					ramos: ramos
				}

				var autorizarNewExperience = formsRepo.getAutoriceNewExperience(params)

				autorizarNewExperience.then(function (data) {
					var browserMin = (browser && browser.name) ? browser.name.toLowerCase() : false;
					if(browser && (browserMin == 'chrome' || browserMin == 'firefox' || browserMin == 'opera' || browserMin == 'edge')) {
						$scope.showNewExperience = data.habilitado;
					} else {
						$scope.showNewExperience = false;
					}
				}, function (data) {
					console.log('Error al obtener el mensaje de accesos a la nueva experiencia: ', data);
				});
			} 

        }, true);
        
        //validaciones
    	$scope.validaForm = function() {
			if($('#autos').css('display') == 'block'){
				if($scope.verificoCompaniaPorUsoComercial()){
					$scope.showAdvice("","Para seguro de Moto de uso comercial no esta permitida la compañía Orbis, si no es un cliente preferencial.", "Aviso");
					return false;
				}
				
				if(cotizadorServ.verificoActividadesNoAseguradas($scope.form.cotiAuto.cdRamo)){
					return false;
				}
			}
    		return true;
    	}

		$scope.verificoCompaniaPorUsoComercial = function() {
			if($scope.userCurrent.isPreferencial == 'false'){
				var auto = $scope.form.cotiAuto;
				return auto.inAutoMoto == 'M' && auto.cdUso == '2' && $scope.ramosNoPermitidos.includes(auto.cdRamo);
			}
			return false;
		}

    	//Obtengo datos de formularios    	
        $scope.viviendas = [];
        $scope.claseVivienda = [];
        $scope.valorM2 = "";

        formsRepo.getValorMetroCuadradoByRamo(function (data) {
            $scope.valorM2 = data.valor;
        }, 21);

        formsRepo.getAllSexos(function(data){ $scope.sexos = data;});
        formsRepo.getAllViviendas(function (data) {
        	$scope.viviendas = data;
			$rootScope.utils.viviendas = data;
			configureSecureServ.setViviendas($scope.viviendas);
        	$scope.form.cotiVivienda.tpCobertura = $scope.form.cotiVivienda.tpCobertura || '1';
        });
        formsRepo.getAllClaseVivienda(function (data) {
        	$scope.claseVivienda = data; 
        	$scope.form.cotiVivienda.cdClaseRiesgo = $scope.form.cotiVivienda.cdClaseRiesgo || 'PER';
        });
		formsRepo.getRamosTipos(function(data){ $scope.insuranceCompanyList = data;});
		formsRepo.getRoboSuma(function(data){ $scope.roboCmbList = data; });
		formsRepo.getTpGncList(function(data){ $scope.tpGncList = data; });
		formsRepo.getTpCoberturas(function(data){ $scope.tpCoberturaList = data; });
        formsRepo.getCondicionLaboral(function(data){ $scope.condLaboralList = data; });
		pricingRepo.getIva(function(data){ $scope.ivaCategories =  data;});
		
        $scope.checkInAutoMoto = function(){
    		$scope.form.cotiAuto.cdModeloRaw = '';
    		$scope.searchTextModelo = '';
    		$scope.carModels = [];
    		$scope.form.cotiAuto.cdMarca = '';
    		$scope.searchTextMarca = '';
    		$scope.carBrands = [];
    		$scope.form.cotiAuto.in0km = 'N';
    		$scope.form.cotiAuto.nuAnio = '';
        };

        $scope.checkAnio0Km = function(tpElemento){
    		$scope.form.cotiAuto.cdModeloRaw = '';
    		$scope.searchTextModelo = '';
    		$scope.carModels = [];
    		$scope.form.cotiAuto.cdMarca = '';
    		$scope.searchTextMarca = '';
    		$scope.carBrands = [];
    		if(tpElemento=='input'){
    			if(!$scope.form.cotiAuto.nuAnio){
    				$scope.form.cotiAuto.in0km = 'N';
    			}
    		} else {
	        	if($scope.form.cotiAuto.in0km != 'N'){
	        		var year = new Date();
	        		$scope.form.cotiAuto.nuAnio = year.getFullYear();
	        	}else{
	        		$scope.form.cotiAuto.nuAnio = $scope.form.cotiAuto.nuAnio || undefined;
	        	};
    		}
        	if($scope.form.cotiAuto.nuAnio){
        		formsRepo.getCarBrands(function (data) { $scope.carBrands = data; }, $scope.form.cotiAuto.inAutoMoto, $scope.form.cotiAuto.nuAnio);
    		}
        };

        /*-----------autocomplete-------------*/
        $scope.querySearch = function querySearch(query, list) {
            var results = query ? $scope[list].filter(function (el) {
                return el.descripcion.toUpperCase().indexOf(query.toUpperCase()) > -1;
            }) : $scope[list], deferred;
            return results;
        };
        $scope.selectedItemChange = function selectedItemChange(item, ramoForm, attr) {
            if (item != undefined) {
            	$scope.form[ramoForm][attr] = item;
            	if(attr == 'cdProvincia'){
            		$scope.searchLocalidad = '';
            		formsRepo.getLocalidadesByProv(function (data) { $scope.localidades = data; }, $scope.form[ramoForm][attr]);
            	}else if(attr == 'provAuto'){
            		$scope.searchLocalidadAut = '';
            		formsRepo.getLocalidadesByProv(function (data) { $scope.localidadesAut = data; }, $scope.form[ramoForm][attr]);
            	}else if(attr == 'cdMarca'){
            		$scope.form.cotiAuto.cdModeloRaw = '';
            		$scope.searchTextModelo = '';
            		$scope.carModels = [];
                    formsRepo.getCarModels(function (data) { $scope.carModels = data; }, item, $scope.form.cotiAuto.nuAnio);
            	};
            };
        };

        /*----- getLimit -------*/
        $scope.getLimitData = function() {
            formsRepo.getMontoSumaLimitsByRamo(function (data) { 
                $scope.form.cotiAcciPers = $scope.form.cotiAcciPers?$scope.form.cotiAcciPers: {};
                $scope.form.cotiAcciPers.limits = data;
            }, 1);
            formsRepo.getMontoSumaLimitsByRamo(function (data) { 
                $scope.form.cotiVida = $scope.form.cotiVida?$scope.form.cotiVida: {};
                $scope.form.cotiVida.limits = data;
            }, 18);
            formsRepo.getMontoSumaLimitsByRamo(function (data) { 
                $scope.form.cotiRoboCaj = $scope.form.cotiRoboCaj?$scope.form.cotiRoboCaj: {};
                $scope.form.cotiRoboCaj.limits = data;
                $scope.form.cotiRoboCaj.mtSumaAseg = Number(data.max);
            }, 19);
            formsRepo.getMontoSumaLimitsByRamo(function (data) { 
                $scope.form.cotiDesempleo = $scope.form.cotiDesempleo?$scope.form.cotiDesempleo: {};
                $scope.form.cotiDesempleo.limits = data;
                $scope.form.cotiDesempleo.mtSumaAseg = Number(data.max);
            }, 20);
            formsRepo.getMontoSumaLimitsByRamo(function (data) { 
                $scope.form.cotiVivienda = $scope.form.cotiVivienda?$scope.form.cotiVivienda: {};
                $scope.form.cotiVivienda.limits = data;
            }, 21);
            formsRepo.getMontoSumaLimitsByRamo(function (data) { 
                $scope.form.cotiProtsalud = $scope.form.cotiProtsalud?$scope.form.cotiProtsalud: {};
                $scope.form.cotiProtsalud.limits = data;
                $scope.form.cotiProtsalud.mtSumaAseg = Number(data.max);
            }, 24);
            formsRepo.getMontoSumaLimitsByRamo(function (data) { 
                $scope.form.cotiProtCartera = $scope.form.cotiProtCartera?$scope.form.cotiProtCartera: {};
                $scope.form.cotiProtCartera.limits = data;
                $scope.form.cotiProtCartera.mtSumaAseg = Number(data.max);
            }, 25);
            formsRepo.getMontoSumaLimitsByRamo(function (data) { 
                $scope.form.cotiCompraprot = $scope.form.cotiCompraprot?$scope.form.cotiCompraprot: {};
                $scope.form.cotiCompraprot.limits = data;
                $scope.form.cotiCompraprot.mtSumaAseg = Number(data.max);
            }, 26);
        };
        

		$scope.$watch("existsAnySelection2", function(){
			if($scope.existsAnySelection2){
				$scope.formCotizador.$setPristine();
			}
		});
        
		$scope.gncSumaAsegRequired = false;
		$scope.gncSumMinLimit;
		$scope.gncSumMaxLimit;
		
		$scope.handleGncDropDown = function(gncItem){
			var parts = gncItem && gncItem.split("|"),
				typeGnc = parts[0],
				minLimit = parts[1],
				maxLimit = parts[2];
			if (typeGnc && (typeGnc != "N")){
				$scope.gncSumaAsegRequired = true;
				$scope.gncSumMinLimit = minLimit;
				$scope.gncSumMaxLimit = maxLimit;
			}else{
                $scope.gncSumaAsegRequired = false;
                $scope.form.cotiAuto.mtSumaGnc = "";
            }
		};

        //------SUBMIT
        $scope.cotizadorSubmit = function(){
			var isFirstResponse = true;
            
			if($('#accpersonales').css('display') == 'block'){
				$scope.form.cotiAcciPers.cdRamo = '1';
                wrapCotizacion($scope.form.cotiAcciPers, pricingRepo.getCotizacionNormal, 1);
            };
			/*if($('#incendio').css('display') == 'block'){
			setClient('cotiIncendio');
			$scope.form.cotiIncendio.cdRamo = '8';
    		$scope.form.cotiIncendio.cdProvincia = $scope.userCurrent.cdProvincia;
    		$scope.form.cotiIncendio.cdPostal = $scope.userCurrent.cdPostal;
			$scope.form.cotiIncendio.cdActividad = $scope.userCurrent.cdProfesion;
            wrapCotizacion($scope.form.cotiIncendio, pricingRepo.getCotizacionNormal, 8);
        };	*/	
        	if($('#vida').css('display') == 'block'){
                $scope.form.cotiVida.cdRamo = '18';
                $scope.form.cotiVida.cdProvincia = $scope.userCurrent.cdProvincia;
                $scope.form.cotiVida.cdPostal = $scope.userCurrent.cdPostal;
                $scope.form.cotiVida.cdActividad = $scope.userCurrent.cdProfesion;
                wrapCotizacion($scope.form.cotiVida, pricingRepo.getCotizacionNormal, 18);
			};		
            if($('#robocajero').css('display') == 'block'){
            	$scope.form.cotiRoboCaj = $scope.form.cotiRoboCaj || {};
                $scope.form.cotiRoboCaj.cdRamo = '19';               
                $scope.form.cotiRoboCaj.cdProvincia = $scope.userCurrent.cdProvincia;
                $scope.form.cotiRoboCaj.cdPostal = $scope.userCurrent.cdPostal;
                $scope.form.cotiRoboCaj.cdActividad = $scope.userCurrent.cdProfesion;
                wrapCotizacion($scope.form.cotiRoboCaj, pricingRepo.getCotizacionNormal, 19);
            };
			if($('#desempleo').css('display') == 'block'){
				$scope.form.cotiDesempleo.cdRamo = '20';        		
				$scope.form.cotiDesempleo.cdProvincia = $scope.userCurrent.cdProvincia;
        		$scope.form.cotiDesempleo.cdPostal = $scope.userCurrent.cdPostal;
				$scope.form.cotiDesempleo.cdActividad = $scope.userCurrent.cdProfesion;
                $scope.form.cotiDesempleo.feNac = $scope.userCurrent.feNac;
                wrapCotizacion($scope.form.cotiDesempleo, pricingRepo.getCotizacionNormal, 20);
            };
        	if($('#vivienda').css('display') == 'block'){
    			var cdLocalidad = null;
    			var codPos = null;
        		if($scope.form.cotiVivienda.codPos != undefined){
        			var localidadExt = $scope.form.cotiVivienda.codPos.split('|');
        			cdLocalidad = localidadExt[0];
        			codPos = localidadExt[1] || $scope.asegurado.cdPostal;
        		};
                $scope.form.cotiVivienda.cdRamo = '21';
                
                if(cdLocalidad == undefined){
                	$scope.form.cotiVivienda.cdLocalidad = $scope.form.cotiVivienda.cdLocalidad || $scope.userCurrent.cdCiudad;
                } else {
                	$scope.form.cotiVivienda.cdLocalidad = cdLocalidad;
                }
                
                if(codPos == undefined){
                	$scope.form.cotiVivienda.cdPostal = $scope.userCurrent.cdPostal;
                } else {
                	$scope.form.cotiVivienda.cdPostal = codPos;
                }
                
                $scope.form.cotiVivienda.cdActividad = $scope.userCurrent.cdProfesion;
                
                $scope.form.cotiVivienda.cdProvincia = $scope.form.cotiVivienda.cdProvincia || $scope.userCurrent.cdProvincia;
                
                if($scope.form.cotiVivienda.deProvincia != undefined){
                	if ($scope.form.cotiVivienda.deProvincia.descripcion !=undefined ){
                        $scope.form.cotiVivienda.deProvincia = $scope.form.cotiVivienda.deProvincia.descripcion;
                	}else{
                		$scope.form.cotiVivienda.deProvincia = $scope.form.cotiVivienda.deProvincia;
                	}
                } else {
                	$scope.form.cotiVivienda.deProvincia = $scope.userCurrent.deProvincia;
                }
                
                if($scope.form.cotiVivienda.deLocalidad != undefined){
                	if ($scope.form.cotiVivienda.deLocalidad.descripcion  != undefined){
                		$scope.form.cotiVivienda.deLocalidad = $scope.form.cotiVivienda.deLocalidad.descripcion;
                	}else{
                		$scope.form.cotiVivienda.deLocalidad = $scope.form.cotiVivienda.deLocalidad;
                	}
                } else {
                	$scope.form.cotiVivienda.deLocalidad = $scope.userCurrent.deCiudad + '(' + $scope.userCurrent.cdPostal + ')';
                };
                
                wrapCotizacion($scope.form.cotiVivienda, pricingRepo.getCotizacionNormal, 21);
            };        	
			/*if($('#integralcomerc').css('display') == 'block'){
				setClient('cotiIntegralComerc');
				$scope.form.cotiIntegralComerc.cdRamo = '22';        		
				$scope.form.cotiIntegralComerc.cdProvincia = $scope.userCurrent.cdProvincia;
        		$scope.form.cotiIntegralComerc.cdPostal = $scope.userCurrent.cdPostal;
				$scope.form.cotiIntegralComerc.cdActividad = $scope.userCurrent.cdProfesion;
                $scope.form.cotiIntegralComerc.feNac = $scope.userCurrent.feNac;
                wrapCotizacion($scope.form.cotiIntegralComerc, pricingRepo.getCotizacionNormal, 22);
            };*/
			if($('#protsalud').css('display') == 'block'){	
				$scope.form.cotiProtsalud = $scope.form.cotiProtsalud || {};
				$scope.form.cotiProtsalud.cdRamo = '24';
        		$scope.form.cotiProtsalud.cdProvincia = $scope.userCurrent.cdProvincia;
        		$scope.form.cotiProtsalud.cdPostal = $scope.userCurrent.cdPostal;
				$scope.form.cotiProtsalud.cdActividad = $scope.userCurrent.cdProfesion;
				$scope.form.cotiProtsalud.cdSexo = $scope.userCurrent.inSexo;
                $scope.form.cotiProtsalud.feNac = $scope.userCurrent.feNac;
                wrapCotizacion($scope.form.cotiProtsalud, pricingRepo.getCotizacionNormal, 24);
            };			
			if($('#protcartera').css('display') == 'block'){
				$scope.form.cotiProtCartera = $scope.form.cotiProtCartera || {};
				$scope.form.cotiProtCartera.cdRamo = '25';
        		$scope.form.cotiProtCartera.cdProvincia = $scope.userCurrent.cdProvincia;
        		$scope.form.cotiProtCartera.cdPostal = $scope.userCurrent.cdPostal;
				$scope.form.cotiProtCartera.cdActividad = $scope.userCurrent.cdProfesion;
                wrapCotizacion($scope.form.cotiProtCartera, pricingRepo.getCotizacionNormal, 25);
            };			
			if($('#compraprot').css('display') == 'block'){
				$scope.form.cotiCompraprot = $scope.form.cotiCompraprot || {};
				$scope.form.cotiCompraprot.cdRamo = '26';
        		$scope.form.cotiCompraprot.cdProvincia = $scope.userCurrent.cdProvincia;
        		$scope.form.cotiCompraprot.cdPostal = $scope.userCurrent.cdPostal;
				$scope.form.cotiCompraprot.cdActividad = $scope.userCurrent.cdProfesion;
				$scope.form.cotiCompraprot.feNac = $scope.userCurrent.feNac;
                wrapCotizacion($scope.form.cotiCompraprot, pricingRepo.getCotizacionNormal, 26);
            };
            
            function wrapCotizacion(formCotizacion, dataService, cdRamo){
            	
            	tmpRamos.push(cdRamo.toString());
            	
                var itemWraped = {
                    firstPricing: {
                        deRamo: menuRamosServ.getRamoById(cdRamo)[0].deRamo,
                        cdRamo: cdRamo
                    },
                    cdRamo: cdRamo,
                    asyncIsDone: false,
                    cotizacionFails: false,
                    itemDeferred: null
                };
                cotizadorServ.setCotizaciones(itemWraped);
                var promis = dataService(formCotizacion);
                promis.then(function(result){
                        result = (typeof result != "object")? {} : result;
                        result.asyncIsDone = true;
                        if ( !(result.cdRamo >= 30 && result.cdRamo <= 40) && !(result.nuCotizacion &&  result.firstPricing)) {
                            result.cotizacionFails = true;
                            result.firstPricing = result.firstPricing || itemWraped.firstPricing;
                        }
                        if ( result.cdRamo >= 30 && result.cdRamo <= 40 ) {//Ramo auto
                            if ( !result.detalleCotizacion.length ){
                                result.cotizacionFails = true;
                                result.firstPricing = result.firstPricing || itemWraped.firstPricing;
                            }else{
                                result.firstPricing = result.firstPricing || itemWraped.firstPricing;
                            }
                            result.deMarca = $scope.searchTextMarca;
                            result.deModelo = $scope.searchTextModelo;
                        }
                        result.limits = formCotizacion.limits;
                        cotizadorServ.updateCotizacion(cdRamo, result);

                });
                if (isFirstResponse){
                    $location.url('/pricing');
                    isFirstResponse = false;
                }
            };

        	if($('#autos').css('display') == 'block'){
        		var localidadExt = null;
    			var cdLocalidad = null;
    			var codPos = null;
    			
        		if($scope.form.cotiAuto.cdPosAuto != undefined){
        			localidadExt = $scope.form.cotiAuto.cdPosAuto.split('|');
        			cdLocalidad = localidadExt[0];
        			codPos = localidadExt[1] || $scope.userCurrent.cdPostal;
        		};
        		var data = {
                    tpGnc: (truncateAtCharFilter($scope.form.cotiAuto.tpGnc, "|", 0))|| "N",
                    cdModelo: truncateAtCharFilter($scope.form.cotiAuto.cdModeloRaw, "|", 0),
                    mtSumaAseg: truncateAtCharFilter($scope.form.cotiAuto.cdModeloRaw, "|", 1),
                    cdProvincia: $scope.form.cotiAuto.provAuto || $scope.userCurrent.cdProvincia,
                    cdLocalidad: cdLocalidad || $scope.userCurrent.cdCiudad,
                    cdPostal: codPos || $scope.userCurrent.cdPostal
                };
        		
        		if($scope.form.cotiAuto.deLocalidad != undefined && $scope.form.cotiAuto.deLocalidad != undefined){
        			$scope.form.cotiAuto.deProvincia = $scope.form.cotiAuto.deProvincia;
                } else {
                	$scope.form.cotiAuto.deProvincia = $scope.userCurrent.deProvincia;
                };
                
        		if($scope.form.cotiAuto.deLocalidad != undefined && $scope.form.cotiAuto.deLocalidad != undefined){
        			$scope.form.cotiAuto.deLocalidad = $scope.form.cotiAuto.deLocalidad;
                } else {
                	$scope.form.cotiAuto.deLocalidad = $scope.userCurrent.deCiudad + '(' + $scope.userCurrent.cdPostal + ')';
                };
                
                var res = {};
                angular.extend(res, $scope.form.cotiAuto, data);
                wrapCotizacion(res, pricingRepo.getCotizacionAuto, 40);
        	};
        	
        	cotizadorServ.setForm($scope.form);
        	
        	menuRamosServ.setRamos(tmpRamos);
        };

        var dialogModalController = ['$scope', '$mdDialog', 'message1', 'title1', 'callback', 
			function($scope, $mdDialog, message1, title1, callback){
			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.modalAdvice = "Validacion";
			$scope.modalMessage = message1;
			$scope.modalTitle = title1;
			$scope.avisoEnterado = function(){
				$scope.hide();
					$timeout(function() {
						callback(callback)
					});
			};
		}];

        //INIT
        if($scope.form.cotiAuto.tpGnc && $scope.form.cotiAuto.tpGnc != "N"){
    		$scope.handleGncDropDown($scope.form.cotiAuto.tpGnc);
    	};

		$scope.nuevaExperiencia = function () {
			configureSecureServ.setRamo(21);
			$location.url('/newExperience');
		}

    }];
})();