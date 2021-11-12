(function(){
    angular.module('formsRepo', [])
    .service('formsRepoService', function(){
    	var ret = function () { };
        
    	//lovs
        var provincias = [];
        var localidades = {};
        var localidadesExt = {};
        var codPost = {};
        var profesiones = [];
        var generos = [];
        var estCiviles = [];
        var tiposDoc= [];
        var parentescos = [];
        var carModel = {};
        var carBrand = {};
        
        ret.setProvincias = function(x){ provincias = x;};
        ret.getProvincias = function(){ return provincias;};
        
        ret.setLocalidades = function(i, x){ localidades[i] = x;};
        ret.getLocalidades = function(i){ return localidades[i];};
        
        ret.setLocalidadesExt = function(i, x){ localidadesExt[i] = x;};
        ret.getLocalidadesExt = function(i){ return localidadesExt[i];};
        
        ret.setCodPost = function(i, x){ codPost[i] = x;};
        ret.getCodPost = function(i){ return codPost[i];};
        
        ret.setProfesiones = function(x){ profesiones = x;};
        ret.getProfesiones = function(){ return profesiones;};
        
        ret.setGeneros = function(x){ generos = x;};
        ret.getGeneros = function(){ return generos;};
        
        ret.setEstCiviles = function(x){ estCiviles = x;};
        ret.getEstCiviles = function(){ return estCiviles;};
        
        ret.setTiposDoc = function(x){ tiposDoc = x;};
        ret.getTiposDoc = function(){ return tiposDoc;};
        
        ret.setParentescos = function(x){ parentescos = x;};
        ret.getParentescos = function(){ return parentescos;};
        
        ret.setCarModel = function(i, x){ carModel[i] = x;};
        ret.getCarModel = function(i){ return carModel[i];};
        
        ret.setCarBrand = function(i, x){ carBrand[i] = x;};
        ret.getCarBrand = function(i){ return carBrand[i];};
        
        ret.resetCache = function(){
        	provincias = [];
            localidades = {};
            localidadesExt = {};
            codPost = {};
            generos = [];
            estCiviles = [];
            tiposDoc= [];
            parentescos = [];
        };
        
        return ret;
    })
    .factory('formsRepo', ['$http', 'formsRepoService', function($http, formsRepoService){
        return {
        	
        	getDataUser: function (cb, dataUser) {
                $http.post(api('cliente/'), dataUser)
                .then(function (data) { cb(data);}, function (data) { cb(data);});
            },
            getDataUserCurrent: function(cb){
            	$http.get(api('cliente/'))
                .then(function (data) { cb(data);}, function (data) { cb(data);});
            },
            getMailClient: function(cb, nup,tpDoc,nuDoc){
            	$http.get('api/cliente/mail?nup='+nup+'&tpDoc='+tpDoc+'&nuDoc='+nuDoc)
                .then(function (data) { cb(data.data.mail);}, function (data) { cb("");});
            },
            getLogout: function(cb){
            	$http.get(api('cliente/logout/'))
                .then(function (data) { 
                	cb(data);
                	formsRepoService.resetCache();
                }, function (data) { cb(data);});
            },
            setDataUserUpdate: function(cb, request){
            	$http.post(api('cliente/actualizar'), request)
                .then(function (data) { cb(data);}, function (data) { cb(data);});
            },
            getAllProvincias: function (cb) {
            	
            	cache = formsRepoService.getProvincias();
            	
            	if(cache.length == 0){
            		$http.get(api('lov/provincias'))               
            		.then(function (data) { 
            			cb(data.data);
            			formsRepoService.setProvincias(data.data);
            		}, function(data) {});
            		
            	} else {
            		cb(cache);
            	}
            },
            getLocalByProv: function(cb, idProv){
            	
            	cache = formsRepoService.getLocalidades(idProv);
            	
            	if(cache != undefined && cache.length > 0){
            		cb(cache);
            	} else {
            		$http.get(api('lov/provincias/' + idProv + '/localidades'))              
            		.then(function (data) { 
            			cb(data.data);
            			formsRepoService.setLocalidades(idProv, data.data);
            		}, function (data) {});
            	}
            },
            getLocalidadesByProv: function (cb, idProv) {
            	
            	cache = formsRepoService.getLocalidadesExt(idProv);
            	
            	if(cache != undefined && cache.length > 0){
            		cb(cache);
	            } else {
	            	$http.get(api('lov/provincias/' + idProv + '/localidadesext'))              
	            	.then(function (data) { 
	            		cb(data.data);
	            		formsRepoService.setLocalidadesExt(idProv, data.data);
	            	}, function (data) {});
	            }
            },
            getCodPostalByLocalidad: function(cb, idProv, idLoc){
            	
            	cache = formsRepoService.getCodPost(idProv+'-'+idLoc);
            	
            	if(cache != undefined && cache.length > 0){
            		cb(cache);
	            } else {
	            	$http.get(api('lov/provincias/' + idProv + '/' + idLoc + '/codigosPostales'))              
	            	.then(function (data) { 
	            		cb(data.data);
	            		formsRepoService.setCodPost(idProv+'-'+idLoc, data.data);
	            	}, function (data) {});
	            }
            },
            getAllViviendas: function (cb) {
                $http.get(api('lov/viviendas'))
                .then(function (data) { cb(data.data); }, function(data) { });
            },
            getAllClaseVivienda: function (cb) {
                $http.get(api('lov/viviendas/coberturas'))
                .then(function (data) { cb(data.data); }, function(data) { });
            },
			getTpVivienda: function (cb) {
                $http.get(api('lov/viviendas/coberturas'))
                .then(function (data) { cb(data.data); }, function(data) { });
            },
            getIncendioTpVivienda: function (cb) {
                $http.get(api('lov/incendio'))
                .then(function (data) { cb(data.data); }, function(data) { });
            },
            getCondicionLaboral: function (cb) {
                $http.get(api('lov/condicionlaboral'))
                .then(function (data) { cb(data.data); }, function(data) { });
            },
            
            getAceptacionDigitalActive: function (cb) {
                $http.get(api('lov/aceptacionDigital'))
                .then(function (data) { cb(data.data);}, function (data) { });
            },
            
            getAceptacionDigitalRamos: function (cb) {
                $http.get(api('lov/aceptacionDigital/ramos'))
                .then(function (data) { cb(data.data);}, function (data) { });
            },
            
            getAceptacionDigitalCanales: function (cb) {
                $http.get(api('lov/aceptacionDigital/canales'))
                .then(function (data) { cb(data.data);}, function (data) { });
            },
            
            getAceptacionDigitalDocs: function (cb) {
                $http.get(api('lov/aceptacionDigital/documentos'))
                .then(function (data) { cb(data.data);}, function (data) { });
            },
            
            //RBF:Notar que Provincias y Localidades esta con mayuscula
            getMenuRamos: function (cb) {
                $http.get(api('ramos/activos'))
                .then(function(data){cb(data.data);}, function (data) { });
            },
			getCarBrands: function(cb, vehicle, year){

				cache = formsRepoService.getCarBrand(vehicle+'-'+year);
            	
            	if(cache != undefined && cache.length > 0){
            		cb(cache);
	            } else {
            		$http.get(api('lov/vehiculos/' + vehicle + '/' + year + '/marcas'))             
            		.then(function (data) { 
            			cb(data.data);
            			formsRepoService.setCarBrand(vehicle+'-'+year,data.data);
            		}, function(data) {});
            	}
			},
			getCarModels: function(cb, brand, year){
				
				cache = formsRepoService.getCarModel(brand+'-'+year);
            	
            	if(cache != undefined && cache.length > 0){
            		cb(cache);
	            } else {
	            	$http.get(api('lov/autos/' + brand + '/modelos/' + year))         
	            	.then(function (data) { 
	            		cb(data.data);
	            		formsRepoService.setCarModel(brand+'-'+year, data.data);
	            	}, function (data) {});
	            }
			},
			getRamosTipos: function(cb){
				$http.get(api('lov/ramos/tipos'))
                .then(function (data) { cb(data.data); }, function (data) { });
			},
			getRoboSuma: function(cb){
				$http.get(api('lov/robotest'))
                .then(function (data) { cb(data.data); }, function (data) { });
			},
			getTpGncList:  function(cb){
				$http.get(api('lov/autos/accesorios'))
                .then(function (data) { cb(data.data); }, function (data) { });
			},
			getTpCoberturas:  function(cb){
				$http.get(api('lov/autos/coberturas'))
                .then(function (data) { cb(data.data); }, function (data) { });
			},
            getCompanias:  function(cb){
                $http.get(api('lov/companias'))
                .then(function (data) { cb(data.data); }, function (data) { });
            },
			getAllProfesiones:  function(cb){
				
				cache = formsRepoService.getProfesiones();
            	
            	if(cache != undefined && cache.length > 0){
            		cb(cache);
	            } else {
	            	$http.get(api('lov/ocupaciones'))
	            	.then(function (data) { 
	            		cb(data.data);
	            		formsRepoService.setProfesiones(data.data);
	            	}, function (data) { });
	            }
			},
			getAllSexos:  function(cb){
				
				cache = formsRepoService.getGeneros();
            	
            	if(cache != undefined && cache.length > 0){
            		cb(cache);
	            } else {
	            	$http.get(api('lov/sexos'))
	            	.then(function (data) { 
	            		cb(data.data);
	            		formsRepoService.setGeneros(data.data);
	            	}, function (data) { });
	            }
			},
			getAllEstadosCiviles:  function(cb){
				
				cache = formsRepoService.getEstCiviles();
            	
            	if(cache != undefined && cache.length > 0){
            		cb(cache);
	            } else {
	            	$http.get(api('lov/estadosciviles'))
	            	.then(function (data) { 
	            		cb(data.data);
	            		formsRepoService.setEstCiviles(data.data);
	            	}, function (data) { });
	            }
			},
            getMontoSumaLimitsByRamo: function(cb, cdRamo){
                $http.get(api('cotizacion/limites/' + cdRamo))
                .then(function (data) { cb(data.data);}, function (data) { });
            },
            getValorMetroCuadradoByRamo: function(cb, cdRamo){
                $http.get(api('cotizacion/valorM2/' + cdRamo))
                .then(function (data) { cb(data.data);}, function (data) { });
            },
			getAllDocumentos:  function(cb){
				
				cache = formsRepoService.getTiposDoc();
            	
            	if(cache != undefined && cache.length > 0){
            		cb(cache);
	            } else {
	            	$http.get(api('lov/documentos'))
	            	.then(function (data) { 
	            		cb(data.data);
	            		formsRepoService.setTiposDoc(data.data);
	            	}, function (data) { });
	            }
			},
			getAllParentescos:  function(cb){
				
				cache = formsRepoService.getParentescos();
            	
            	if(cache != undefined && cache.length > 0){
            		cb(cache);
	            } else {
	            	$http.get(api('lov/parentesco'))
	            	.then(function (data) { 
	            		cb(data.data);
	            		formsRepoService.setParentescos(data.data);
	            	}, function (data) { });
	            }
			},
			getRamosNoPermitidos: function (cb) {
                $http.get(api('ramos/nopermitidos'))
                .then(function(data){cb(data.data);}, function (data) { });
            },
			sendCustomerValidation: function (request) {
	              return $http.post(api('cliente/validateClient'), request)
	              .then(function (response) { return response;});
			},
			getMotoActividadesComercialesNoAseguradas: function (cb) {
                $http.get(api('coberturas/actividadesNoAseguradas'))
                .then(function(data){cb(data.data.actividades);}, function (data) { });
            },
            getCotizacionMotoAsegurado: function (cb, provincia, codigoPostal, metro2, cantidadAmbiente, nup, ramo, sucursal, sec, emple) {
//                $http.get(api('cotizacion/sumaasegurada?provincia=' + provincia + '&codigoPostal=' + codigoPostal + '&metro2=' + metro2 + '&cantidadAmbiente=' + cantidadAmbiente))
              $http.get(api('cotizacion/sumaasegurada/' + provincia + '/' + codigoPostal + '/' + metro2 + '/' + cantidadAmbiente + '/' + nup + '/' + ramo + '/' + sucursal + '/' + sec + '/' + emple))
            	.then(function(data){
                	cb(data.data);
                }, function (data) {cb("");});
            },
			getAllAmbientes: function (cb, cdRamo) {
                $http.get('api/nuevaExperiencia/ambientes?cdRamo=' + cdRamo)
                	.then(function (data) { cb(data.data); }, function(data) { return data;	});
            },
			getInfoUser: function (cb) {
                $http.get(api('nuevaExperiencia/getusuario'))
                .then(function (data) { cb(data.data); }, function(data) { });
            },
			getMedidasDeSeguridad: function(params){
				return  $http.get('api/coberturas/medidas_seguridad_piso?nup= ' + params.nup + '&suc=' + params.suc+ '&edo=' + params.edo+ '&ciudad=' + params.ciudad + '&post=' + params.post + '&categ=' + params.categ + '&clasif=' + params.clasif + '&ramo=' + params.ramo)
							.then(function(response){
								return response;
							}, function(response){
                                return response
                            });
			},
			getAutoriceNewExperience: function (params) {
				return $http.get('api/nuevaExperiencia/?cdSuc=' + params.cdSuc + '&ramos=' + params.ramos)
							.then(function(data){
								return data.data;
							}, function (data) {
								return data;
							});
			},
			setEmit: function(request){
            	return $http.post(api('cotizacion/emisioni'), request)
                		.then(function (response) { return response;},
                		function (response) { return response;});
            },
        	getDataAsegurado: function (cb, dataUser) {
                $http.post(api('cliente/asegurado/'), dataUser)
                .then(function (data) { cb(data);}, function (data) { cb(data);});
            },
        };
    }]);
})();