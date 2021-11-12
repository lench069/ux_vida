(function () {
    angular.module('issueRepo', [])
    .service('issueRepoService', function(){
    	var ret = function () { };
        
    	//lovs
        var origenFondos = [];
        var cuentas = [];
        var paises = [];
        var inTarjetas = {};
                
        
        ret.setOrigenFondos = function(x){ origenFondos = x;};
        ret.getOrigenFondos = function(){ return origenFondos;};
        
        ret.setCuentas = function(x){ cuentas = x;};
        ret.getCuentas = function(){ return cuentas;};
        
        ret.setPaises = function(x){ paises = x;};
        ret.getPaises = function(){ return paises;};
        
        ret.setInTarjetas = function(i, x){ inTarjetas[i] = x;};
        ret.getInTarjetas = function(i){ return inTarjetas[i];};
        
        ret.resetCache = function(){
        	origenFondos = [];
            cuentas = [];
            paises = [];
        };
        
        return ret;
    })
    .factory('issueRepo', ['$http', 'issueRepoService', function ($http, issueRepoService) {
        return {
        	getAllOrigenFondos: function(cb){
        		
        		cache = issueRepoService.getOrigenFondos();
            	
            	if(cache.length == 0){
            		$http.get(api('lov/origenfondos/'))        
            		.then(function (data) { 
            			cb(data.data);
            			issueRepoService.setOrigenFondos(data.data);
            		}, function(data) {});
            		
            	} else {
            		cb(cache);
            	}
            },
            getMedioPago: function(cb){
            	$http.get(api('cotizacion/mediopagos'))
                .then(function (data) { cb(data); }, function (data) {});
            },
        	getTarjetasOtros: function(cb, request){
        		
        		cache = issueRepoService.getCuentas();
            	
            	if(cache.length == 0){
            		$http.get(api('lov/cuentas'))
            		.then(function (data) { 
            			cb(data.data);
            			issueRepoService.setCuentas(data.data);
            		}, function(data) {});
            		
            	} else {
            		cb(cache);
            	}
            },
            getVigencia: function(cb, request){
            	$http.get(api('cotizacion/vigencia/'+request.cdRamo))
                .then(function (data) { cb(data); }, function (data) {});
            },
            getAllPaises: function(cb, request){
            	
            	cache = issueRepoService.getPaises();
            	
            	if(cache.length == 0){
            		$http.get(api('lov/paises'))
            		.then(function (data) { 
            			cb(data.data);
            			issueRepoService.setPaises(data.data);
            		}, function(data) {});
            		
            	} else {
            		cb(cache);
            	}
            },
            getTarjetasByRamo: function(cb, request){
            	
            	$http.get(api('cliente/intarjetas/'+request))              
            	.then(function (data) { 
            		cb(data.data);
            		issueRepoService.setInTarjetas(request.cdRamo + "-" + request.cdProd, data.data);
            	}, function (data) {});
            
            },
            getAllCuentas: function(cb, request){
            	
            	var transform = function(data){
                    return $.param(data);
                };
                
                var config = {
                  headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                	transformRequest: transform
                };
                
            	$http.post(api('cliente/mediospago'), request, config)
                .then(function (data) { cb(data.data); }, function (data) {});
            },
            setEmit: function(request){
            	return $http.post(api('cotizacion/emision'), request)
                		.then(function (response) { return response;}, 
                		function (response) { return response;});
            },
            getAceptacionDigitalEndpoint: function(cb){
            	$http.get(api('aceptacionDigital/endpointAd'))
                .then(function (data) { cb(data.data.endpoint); }, function (data) { cb("");});
            },
            sendValidacionesAceptacionDigital: function (request, endpoint) {
//                return $http.post(endpoint+"/vida", request)
                return $http.post(api('aceptacionDigital/multi'), request)
                .then(function (response) { return response;});
            },
            
            sendValidacionesAceptacionDigitalList: function (request, endpoint) {
//                return $http.post(endpoint+"/multi", request)
                return $http.post(api('aceptacionDigital/multi'), request)
                .then(function (response) { return response;});
            },
            
            setEmitI: function(request){
            	return $http.post(api('cotizacion/emisioni'), request)
							.then(function (response) {
								return response.data;
							}, function (response) {
								return response.data;
							});
        	},
        	setDigitalVerification: function(request){
             	return $http.post(api('digital/check'), request)
 							.then(function (response) {
 								return response;
 							}, function (response) {
 								return response;
 							});
         	},
            getPolizas: function(cb, request){
            	$http.get(api('cotizacion/polizas'))
	        		.then(function (data) { cb(data.data); }, function (data) {});
            },
            delCotiEmit: function(request){
            	return $http.get(api('cotizacion/emision/delete/' + request))
                		.then(function (response) { return response;}, 
                		function (response) { return response;});
            },
            setPrint: function(cb, request){
            	$http.post(api('cotizacion/imprimirCotizacion'), request)
                .then(function (data) { 
                	if (window.navigator.msSaveOrOpenBlob) {
                		var blob = new Blob([data.data], { type: 'application/pdf' });
                	    window.navigator.msSaveBlob(blob, 'cotizacion.pdf');	//IE11
                	} else {
                	    var link = angular.element('<a/>');
                	    link.css({display: 'none'});
                	    angular.element(document.body).append(link);
						var blob = new Blob([data.data], { type: 'application/pdf' });
                	    link.attr({
                	        href: window.URL.createObjectURL(blob),
                	        target: '_blank',
                	        download: 'cotizacion.pdf'
                	})[0].click();
                	link.remove();
                	}
                }, function (data) {});
            },
            setPrintPoliza: function(cb, request){
            	
            	var transform = function(data){
                    return $.param(data);
                };
                
                var config = {
                  headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                	transformRequest: transform
                };
                
                $http.post('/ImpresionServlet', request, config)
                	.then(function (data) { cb(data.data); }, function (data) {});
            	
            }
        };
    }]);
})();