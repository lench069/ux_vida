﻿﻿(function () {
    angular.module('customer', [])
    .directive('customer', function(){
        return {
            restrict: 'E',
            templateUrl: './src/forms/customer/customer.html',
            controller: customerController,
            link: function(scope, elm, attrs, ctrl){
            	$('#btnForm1').on('click', function(){ scope.validForm = true; });
            	$('#nuDoc').on('focus', function(){ scope.msjValidUser = false;});
            },
            replace: true
        };
    })
    .service('customerServ', function(){
    	var ret = function () { };
        var user = {};
        var provincias = [];
        var provinciasAut = [];
        var localidades = [];
        var localidadesAut = [];
        
        ret.setProvincias = function(x){ provincias = x;};
        ret.getProvincias = function(){ return provincias;};
        
        ret.setProvinciasAut = function(x){ provinciasAut = x;};
        ret.getProvinciasAut = function(){ return provinciasAut;};
        
        ret.setLocalidades = function(x){ localidades = x;};
        ret.getLocalidades = function(){ return localidades;};
        
        ret.setLocalidadesAut = function(x){ localidadesAut = x;};
        ret.getLocalidadesAut = function(){ return localidadesAut;};
        
        ret.setUser = function(dataUser){ user = dataUser;};
        ret.getUser = function(){ return user;};
        ret.resetUser = function(){ user = {};};
        return ret;
    })
	.run(['$window', '$rootScope','customerServ','formsRepo', '$mdDialog', function($window, $rootScope,customerServ,formsRepo,$mdDialog) {
		    $window.addEventListener('message', function(e) {
				var user = $rootScope.customerServ.getUser();
				if (user.enri.enriHost == e.origin){
					var respuesta = e.data.split('|');
					if (respuesta[0]==0){
		    			var riesgo = respuesta[1].substr(1);
						
						user.enri.cdRiesgoBSR = riesgo;
						user.cdRiesgoBSR = riesgo;
						formsRepo.setDataUserUpdate(function (data) {}, user);
						customerServ.setUser(user);
						alert('Encuesta realizada con exito.\nNivel de Riesgo del Cliente: "' + riesgo + '"');
		    		}else{
		    			//1: Session Expirada
			    		//2: País de residencia prohibido. Requiere autorización UPBC
			    		//3: País de residencia restringido. Requiere autorización UPBC
			    		//4: Bloqueado por no presentar constancia de inscripción ante la UIF
			    		//-1: Error en el aplicativo ENRI
		    			alert(respuesta[1]);
	    			};
					$mdDialog.hide();
				}
    });
	}])	
	;
    
    var customerController = ['$rootScope', '$window','$timeout', '$scope', 'formsRepo', 'issueRepo', 'menuRamosServ', 'customerServ', 'cotizadorServ', 'formEmitServ', '$location','$mdDialog', '$mdToast', '$sce', 'configureSecureServ', function ($rootScope,$window, $timeout, $scope, formsRepo, issueRepo, menuRamosServ, customerServ, cotizadorServ, formEmitServ, $location, $mdDialog, $mdToast,$sce, configureSecureServ) {
    	
    	$scope.validForm = false;
    	$scope.msjValidUser = false;
    	var listaSeguros = [];
    	$scope.provincias = [];
    	$scope.localidades = [];
    	$scope.cdPostales = [];
    	$scope.profesiones = [];
    	$scope.tpDocs = [];
        $scope.user = {};
        $scope.dataUser = {};
        $scope.cdCanalBco = 0;
        var optionForm = '';
		if (!$rootScope.volverCotiVivienda && !$rootScope.goEncuestaEnri) {
			$rootScope.cotizacion = {};
			$rootScope.utils = {};
		}
		
        if(sessionStorage.currentPath != undefined && sessionStorage.currentPath == $location.path()
				&& sessionStorage.user != undefined && document.referrer == ""){
			
        	$scope.cdCanalBco = sessionStorage.cdCanalBco;
			customerServ.setUser(JSON.parse(sessionStorage.user));
		}
        
		// if($rootScope.refresh){ location.reload();$rootScope.refresh=false;}

        sessionStorage.clear();
        $('.loadingSVG').hide();
		$('.container-fluid').removeClass('loading');
		
        //improve performance Test Feg
        formsRepo.getAllSexos(function(data){ $scope.sexos = data; $rootScope.utils.sexos = data; });
        formsRepo.getAllEstadosCiviles(function(data){ $scope.estadosCiviles = data; $rootScope.utils.estadosCiviles = data; });
        formsRepo.getAllProvincias(function(data){ $scope.provincias = data; $rootScope.utils.provincias = data; });
        formsRepo.getAllProfesiones(function(data){ $scope.profesiones = data; $rootScope.utils.profesiones = data; });
        formsRepo.getAllDocumentos(function(data){ $scope.tpDocs = data; $rootScope.utils.tiposDocuementos = data; });
        formsRepo.getAllParentescos(function(data){});
        issueRepo.getAllOrigenFondos(function(data){});
        issueRepo.getTarjetasOtros(function(data){});
        issueRepo.getAllPaises(function(data){ $rootScope.utils.paises = data; });
		configureSecureServ.resetUser();

        
        //--------Functions
        var resetUser = function(){
        	$scope.user = {};
        	$scope.searchText = '';
        	$scope.searchTextProv = '';
        	$scope.searchTextLoc = '';
        	$scope.searchTextCp = '';
        	$scope.dataUser.tpDoc = '';
        };
        $scope.getState = function(idForm) {
            if (idForm == optionForm) { return 'activeForm'; } else { return 'inactiveForm'; }
        };
        $scope.getTipoDni = function(tpDoc){
        	var tipo = '';
        	switch(tpDoc) {
	        	case 'D': tipo = 'Cdi'; break;
	        	case 'L': tipo = 'Cuil'; break;
	        	case 'T': tipo = 'Cuit'; break;
	        	case 'I': tipo = 'Cedula ident.'; break;
	        	case 'M': tipo = 'Cedula milit.'; break;
	        	case 'F': tipo = 'Certif. intern.'; break;
	        	case 'N': tipo = 'Dni'; break;
	        	case 'X': tipo = 'Dni extranj'; break;
	        	case 'C': tipo = 'Libreta civ.'; break;
	        	case 'E': tipo = 'Libreta enrol'; break;
	        	case 'P': tipo = 'Pasaporte'; break;
        	};
        	return tipo;
        };
        
        var queryStringParamsCdOrig = null;
        
        //Fix Feg
        var isUserSession = false;
        $scope.dataUser = customerServ.getUser();
    	if($scope.dataUser != undefined && $scope.dataUser.nuDoc != undefined){
    		isUserSession = true;
    		optionForm = 'form3';
    		$scope.tpDoc = $scope.getTipoDni($scope.dataUser.tpDoc);
    		$scope.feNacDate = moment($scope.dataUser.feNac).toDate();
    	} else {
    		cotizadorServ.setSessionIni(false);
    	}
    	
    	if(window.location.search){
	    	queryStringParamsCdOrig = QueryStringToHash(window.location.search.substr(1)).cdOrig;
	    	cotizadorServ.setCdCanalBco(queryStringParamsCdOrig);
	    	$scope.cdCanalBco = $scope.cdCanalBco || queryStringParamsCdOrig;
    	}
    	
        if (!isUserSession){ 

        	//Control vista de formularios
	        formsRepo.getDataUserCurrent(function (data) {
	        	if(data.status == 200){
	        		
	        		if($scope.cdCanalBco == '21'){
	                	cotizadorServ.reset();
	                	formEmitServ.reset();
	                	formsRepo.getLogout(function (data){});
	                	optionForm = 'form1';
	                	customerServ.resetUser();
	                }else{
                    	$scope.disabledInput = false;
                		$scope.disabledCuitCuil = false;
                		
                		if(!valUserData(data.data)){
		        			$scope.dataUser = data.data;
		        			
		        			if($scope.dataUser.feNac == undefined || $scope.dataUser.feNac == ''){
		        				$scope.feNacDate = '';
		        			} else {
		        				$scope.feNacDate = moment($scope.dataUser.feNac).toDate();
		        			}
		        			
		                	$scope.tpDoc = $scope.getTipoDni($scope.dataUser.tpDoc);
		                
		                	optionForm = 'form2';
		                	
		                	$scope.form2Submit();
		        		}else{
	                    	$scope.disabledInput = true;
	                		$scope.disabledCuitCuil = true;
		        			$scope.dataUser = data.data;
		                	$scope.feNacDate = moment($scope.dataUser.feNac).toDate();
		                	$scope.tpDoc = $scope.getTipoDni($scope.dataUser.tpDoc);
		                	if($scope.dataUser.nuCuitCuil == 0 || data.data.inCliente != 'CLI'){
		                		$scope.disabledCuitCuil = false;
		                	};
		                	
		                	formsRepo.getLocalByProv(function (data) {
		                		$scope.localidades = data; 
		                		
		                		formsRepo.getCodPostalByLocalidad(function (data) {
		                			$scope.cdPostales = data; 
		                		
		                			/*valido localidad postal*/
		                			if(!validaAutocomplete($scope.dataUser.deProvincia, 'provincias')){ 
		                				$scope.msjValidProv = 'Seleccione una provincia de la lista.'; 
		                			} else {
		                				$scope.msjValidProv = null;
		                			};
		                			
		                			if(!validaAutocomplete($scope.dataUser.deCiudad, 'localidades')){ 
		                				$scope.msjValidLoc = 'Seleccione una localidad de la lista.'; 
		                			} else {
		                				$scope.msjValidLoc = null;
		                			};
		                			
		                			if(!validaAutocomplete($scope.dataUser.cdPostal, 'cdPostales')){ 
		                				$scope.msjValidCp = 'Seleccione un código postal de la lista.'; 
		                			} else { 
		                				$scope.msjValidCp = null;
		                			};
		                			
		                			if(!validaAutocomplete($scope.dataUser.deProfesion, 'profesiones')){ 
		                				$scope.msjValidProf = 'Profesión inválido.'; 
		                			} else { 
		                				$scope.msjValidProf = null;
		                			};
		                			
	                				optionForm = 'form2';
		                		
		                		}, $scope.dataUser.cdProvincia, $scope.dataUser.cdCiudad);
		                		
		                	}, $scope.dataUser.cdProvincia);
		        		};
	                };
	        	} else {
	        		optionForm = 'form1';
	        	};
	        });
        } else {
        	
        	selectedRamos = menuRamosServ.getSelectedRamos();
        	
        	if (window.location.search){
                var queryStringParams =QueryStringToHash(window.location.search.substr(1));
                
                if(menuRamosServ.getSelectedRamos().length == 0){
                	selectedRamos = queryStringParams.cdramo.split(",");
                	menuRamosServ.setRamos(selectedRamos);
                }                	
            };
            
         	
        };
		//PopUp Encuesta Enri
		$scope.showEncuestaEnri = function(enriUrlEncuesta){
			$rootScope.goEncuestaEnri = true;
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
	
        
        //PopUp aviso!
        $scope.showAdvice = function(message, errorList1,titleOne){
        	$mdDialog.show({
                locals: {
                    list1: errorList1,
                    title1: titleOne,
                    callback: function(){}
                },
        		controller: dialogModalController,
        		templateUrl: './src/pricing/modal/modalAlertConfirmation.html',
        		parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen
        	});
        };
        var dialogModalController = ['$scope', '$mdDialog', 'list1', 'title1', 'callback', 
			function($scope, $mdDialog, list1, title1, callback){
			$scope.hide = function () {
				$mdDialog.hide();
			};
			$scope.modalAdvice = "Validacion";
			$scope.modalMessage = list1;
			$scope.modalTitle = title1;
			$scope.avisoEnterado = function(){
				$scope.hide();
					$timeout(function() {
					});
			};
		}];
        //-------Form1
        $scope.form1Submit = function () { 
        	$('#btnForm1').attr("disabled", true); 				
        	$timeout(function() {
        		var paramData ={}
        		paramData.customerDocNumber=  $scope.user.nuDoc;				
	    		paramData.customerDocType= "";
	        	var promis = formsRepo.sendCustomerValidation(paramData);
	    		promis.then(function(result){
	    			if(result.data.listadoErrores.length != 0){
	    				console.log(result.data.listadoErrores);
	    				$scope.showAdvice("mensaje", result.data.listadoErrores, "Causa: ");
	    			}else{
	    				formsRepo.getAllSexos(function(data){ $scope.sexos = data; });
	    	        	formsRepo.getAllEstadosCiviles(function(data){ $scope.estadosCiviles = data; });
	    	        	formsRepo.getAllProvincias(function(data){ $scope.provincias = data; });
	    	            formsRepo.getAllProfesiones(function(data){ $scope.profesiones = data; });
	    	            formsRepo.getAllDocumentos(function(data){ $scope.tpDocs = data; });
	    	            var nuDoc = $scope.user.nuDoc;
	    	            if($scope.user.feNacDate != '' && $scope.user.feNacDate != undefined){
	    	            	var feNac = $scope.user.feNacDate;
	    	                $scope.user.feNac = moment(feNac).format("YYYYMMDD");
	    	            }
	    	            $scope.user.nuDoc = nuDoc;
	    	            var request = { "nuDoc":$scope.user.nuDoc, "feNac":$scope.user.feNac };
	    	            formsRepo.getDataUser(function (data) {
	    	            	if(data.status == 401){ 
	    	                    window.location.href = window.location.origin + "/login.do";
	    	                };
	    	                
	    	                var message = data.data.mensaje;
	    					if(message != ''){
	    			            $mdToast.show($mdToast.simple().textContent(message).hideDelay(6000).position("bottom left"));
	    			            if (message.indexOf("sinonimos") > -1) {
	    			            	changeUser();
	    			            }
	    					};

	    	                $scope.dataUser = data.data;
//	    	                var allIsBlocked = true;
//	    	                data.data.cuentas.forEach(function (item) {
//	    	                	if(item.isHabilitada){
//	    	                		allIsBlocked = false;
//	    	                	}
//	    	                });
//	    	                
//	    	                $scope.allAccountBlocked = allIsBlocked;

	    	                $scope.msjValidUser = false;
	    	                $scope.disabledInput = false;
	    	                $scope.disabledCuitCuil = false;
	    	                
	    	        		if(data.data.inCliente != 'CLI' && (data.data.nup == '0' || data.data.nup == '00000000')){
	    	            		$scope.feNacDate = $scope.user.feNacDate;
	    	            	}else{
	    	                	$scope.feNacDate = moment($scope.dataUser.feNac).toDate();
	    	                	$scope.disabledInput = true;
	    	            		$scope.disabledCuitCuil = true;
	    	            	};
	    	            	$scope.dataUser.nuDoc = $scope.user.nuDoc;
	    	            	$scope.dataUser.feNac = $scope.user.feNac;
	    	            	formsRepo.getLocalByProv(function (data) { $scope.localidades = data; }, $scope.dataUser.cdProvincia);
	    	            	formsRepo.getCodPostalByLocalidad(function (data) { $scope.cdPostales = data; }, $scope.dataUser.cdProvincia, $scope.dataUser.cdCiudad);
	    	            	if($scope.dataUser.nuCuitCuil == 0 || $scope.dataUser.inCliente != 'CLI'){
	    	            		$scope.disabledCuitCuil = false;
	    	            	};
	    	            	optionForm = 'form2';   	
	    	            }, request); 
	    			}
	    			$('.loadingSVG').hide();
	        		$('.container-fluid').removeClass('loadingFx');

	    		}, function(){ 
	    			alert("Ocurrio un problema con el servicio de verificacion.");
	    			$('.loadingSVG').hide();
	        		$('.container-fluid').removeClass('loadingFx');
	    		});
        	}, 2000);
        };
        
        /*-----------autocomplete-------------*/
        $scope.querySearchCust = function querySearch(query, list) {
            var results = query ? $scope[list].filter(function (el) {
                return el.descripcion.toUpperCase().indexOf(query.toUpperCase()) > -1;
            }) : $scope[list], deferred;
            return results;
        };
        $scope.selectedItemChangeCust = function selectedItemChange(item, attr) {
            if (item != undefined) {
            	$scope.dataUser[attr] = item;
            	if(attr == 'cdProvincia'){
            		 $scope.msjValidProv = null;
            		 formsRepo.getLocalByProv(function (data) { $scope.localidades = data;
	            		 $scope.dataUser.cdLocalidad = '';
	                     $('md-autocomplete#localidad input').val('');
	            		 $scope.dataUser.cdPostal = '';
	                     $('md-autocomplete#postal input').val('');
            		 }, $scope.dataUser.cdProvincia);
                }else if(attr == 'cdCiudad'){
                	$scope.msjValidLoc = null;
                    formsRepo.getCodPostalByLocalidad(function (data) { $scope.cdPostales = data; }, $scope.dataUser.cdProvincia, $scope.dataUser.cdCiudad);
            	}else if(attr == 'cdPostal'){
            		$scope.msjValidCp = null;
            	};
            };
        };
        /*------------------------------------*/
        
        var validaAutocomplete = function(textSelected, list){
        	var listFiltered = $scope.querySearchCust( textSelected, list);
        	var boolean = false;
        	$.each(listFiltered, function(i, item){
        		if(textSelected == item.descripcion){ boolean = true;};
        	});
        	return boolean;
        };
        
        //-------Form2
        $scope.form2Submit = function () {
        	/*valido localidad postal*/
        	if(!validaAutocomplete($scope.searchTextProv, 'provincias')){ 
        		$scope.msjValidProv = 'Seleccione una provincia de la lista..'; 
        		$('#provincia').find('input').focus(); 
        		return;
        	}else{ $scope.msjValidProv = null;};
        	if(!validaAutocomplete($scope.searchTextLoc, 'localidades')){ 
        		$scope.msjValidLoc = 'Seleccione una localidad de la lista.'; 
        		$('#localidad').find('input').focus(); 
        		return;
        	}else{ $scope.msjValidLoc = null;};
        	if(!validaAutocomplete($scope.searchTextCp, 'cdPostales')){ 
        		$scope.msjValidCp = 'Seleccione un código postal de la lista.'; 
        		$('#postal').find('input').focus(); 
        		return;
        	}else{ $scope.msjValidCp = null;};
        	
        	if($scope.feNacDate == '' || $scope.feNacDate == undefined){
        		$scope.dataUser.feNac = '';
        	}else{
        		$scope.dataUser.feNac = moment($scope.feNacDate).format("YYYYMMDD");
        	}     
            optionForm = 'form3';
            $("html, body").animate({ scrollTop: 0 }, 600);

            $scope.dataUser.deProvincia = $('md-autocomplete#provincia input').val();
            $scope.dataUser.deCiudad = $('md-autocomplete#localidad input').val();
            $scope.dataUser.cdPostal = $('md-autocomplete#postal input').val();
            $scope.dataUser.deProfesion = $('md-autocomplete#cdProfesion input').val();
            $scope.dataUser.deEdoCivil = $('md-select#cdEdoCivil .md-select-value .md-text').text();
            $scope.dataUser.deSexo = $('md-select#inSexo .md-select-value .md-text').text();
            $scope.tpDoc = $scope.getTipoDni($scope.dataUser.tpDoc);
            $scope.dataUser.domicilio = ($scope.dataUser.domCalle || '') + ' ' + ($scope.dataUser.domNro || '');
            if($scope.dataUser.domPiso != null && $scope.dataUser.domPiso != undefined && $scope.dataUser.domPiso != ''){
            	$scope.dataUser.domicilio = $scope.dataUser.domicilio + ' Piso ' + ($scope.dataUser.domPiso || '');
            };
            if($scope.dataUser.domDepto != null && $scope.dataUser.domDepto != undefined && $scope.dataUser.domDepto != ''){
            	$scope.dataUser.domicilio = $scope.dataUser.domicilio + ' Dpto ' + ($scope.dataUser.domDepto || '');
            };
            $scope.dataUser.domicilio = $scope.dataUser.domicilio.toLocaleUpperCase();
			
			configureSecureServ.setUser($scope.dataUser);
			$rootScope.cotizacion.dataUser = $scope.dataUser;
			$rootScope.cotizacion.listaSeguros = listaSeguros;

			formsRepo.getInfoUser(function(response){
				configureSecureServ.setUserSuc(response.data);
				$rootScope.cotizacion.dataUserSuc = response.data;
			});

			formsRepo.setDataUserUpdate(function (data) {
				if(data.status == 412){
					var message = data.data.mensaje;
					optionForm = 'form2';
					$mdToast.show($mdToast.simple().textContent(message).hideDelay(6000).position("bottom left"));
				} else {
					var selectedRamos = menuRamosServ.getSelectedRamos();
					if (window.location.search){
						var queryStringParams =QueryStringToHash(window.location.search.substr(1));
						if(selectedRamos.length == 0){
							selectedRamos = queryStringParams.cdramo.split(",");
						}
					}
					menuRamosServ.setRamos(selectedRamos);
				};
			}, $scope.dataUser);
            customerServ.setUser($scope.dataUser);
        };
        
        valUserData = function(userData){
        	if(userData.cdProvincia && userData.cdCiudad && userData.tpDoc && userData.feNac
        			&& userData.cdProfesion && userData.cdEdoCivil && userData.inSexo && userData.domicilio){
        		return true;
        	} else {
        		return false;
        	}
        };
        
        
        //--------Cambio de usuario
        $scope.changeUser = function(){
        	$('#btnForm1').attr("disabled", false); 				
        	if($scope.cdCanalBco != '21'){
        		window.location.href = $rootScope.referrer;
        	}
        	
        	formsRepo.getLogout(function (data){});
        	menuRamosServ.resetRamos();
            optionForm = 'form1';
            resetUser();
            customerServ.resetUser();
            cotizadorServ.setSessionIni(false);
            var form = { cotiVivienda: {}, cotiCompraprot: {}, cotiAuto: {}};
            cotizadorServ.setForm(form);
        };
        
        window.onbeforeunload = function () {
        	sessionStorage.currentPath = $location.path();
        	sessionStorage.cdCanalBco = $scope.cdCanalBco;
        	sessionStorage.user = JSON.stringify(customerServ.getUser());
        	
    	};
    }];
})();