(function () {
    angular.module('pricingRepo', [])
    .factory('pricingRepo', ['$http', function ($http) {
        return {

            getAllCotizaciones: function (cb, request) {
                $http.post(api('cotizacion/normal'), request)                              
                .then(function (data) { cb(data.data); }, function(data) { cb(data.status);});
            },
			getCotizacionNormal: function(params){
				return  $http.post(api('cotizacion/normal'), params)
							.then(function(response){
								return response.data;
							}, function(response){
                                return response.data;
                            });
			},
			getCotizacionAuto: function(params){
				return  $http.post(api('cotizacion/auto'), params)
							.then(function(response){
								return response.data;
							}, function(response){
                                return response.data;
                            });
			},
            getCotizacionNormalRecotizar: function(cb, params){
                $http.post(api('cotizacion/normal/recotizar'), params)
                            .then(function(data){
                                cb(data.data);
                            }, function(response){
                            });
            },
            getCobertura: function (cb, request) {
                $http.get(api('coberturas/?cdSuc='+request.cdSuc+'&nuCoti='+request.nuCoti+'&cdRamo='+request.cdRamo+'&cdProd='+request.cdProd+'&cdPlan='+request.cdPlan, true))
                .then(function (data) { cb(data.data); }, function(data){});
            },
            getCoberturaNewExp: function (cb, request) {
                $http.get(api('coberturas/?cdSuc='+request.cdSuc+'&nuCoti='+request.nuCoti+'&cdRamo='+request.cdRamo+'&cdProd='+request.cdProd+'&cdPlan='+request.cdPlan, true))
                .then(function (data) { console.log(request); data.data.it = request.it; cb(data.data); }, function(data){});
            },
            getIva: function (cb) {
                $http.get(api('lov/iva'))                              
                .then(function (data) { cb(data.data); }, function(data) { cb(data.status);});
            },
			getIvaPyme: function (cb) {
                $http.get(api('lov/iva/pyme'))                              
                .then(function (data) { cb(data.data); }, function(data) { cb(data.status);});
            },
            setCotizacionSelect: 
            	function(request){
            		return $http.post(api('cotizacion/select'), request)
                        	.then(function (response) {
            								return response;
            							}, function (response) {
            								return response;
            							});
            },
            doViviendaPersonalizar: function(cb, request){
                $http.post(api('coberturas/personalizar'), request)
                .then(function(data){ cb(data.data); }, function(data){});
            },
            doViviendaPersonalizar2: function(cb, request){
                $http.post(api('coberturas/actualizar'), request)
                .then(function(data){ cb(data.data); }, function(data){});
            },
            getGroupCoberturas: function (cb, request) {
                $http.get(api('coberturas/agrupar?cd_ramo=' + request.cd_ramo + '&cd_prod=' + request.cd_prod + '&cd_plan=' + request.cd_plan, true))
                .then(function (data) { cb(data.data); }, function(data){});
            },
            getAsistencias: function (cb, request) {
                $http.get(api('coberturas/asistencias?cd_ramo=' + request.cd_ramo + '&cd_prod=' + request.cd_prod, true))
                .then(function (data) { cb(data.data); }, function(data){});
            },
            getMascota: function (cb, request) {
                $http.get(api('coberturas/mascota?cd_ramo=' + request.cd_ramo + '&cd_prod=' + request.cd_prod + '&cd_plan=' + request.cd_plan, true))
                .then(function (data) { cb(data.data); }, function(data){});
            },
            doResetCotizaciones: function(cb){
                $http.post(api('cotizacion/reset'))
                .then(function(data){ cb(data); }, function(data){});
            },
            getExcluciones: function (cb, request) {
                $http.get(api('coberturas/exclusiones?cd_ramo=' + request.cd_ramo + '&cd_prod=' + request.cd_prod + '&cd_plan=' + request.cd_plan, true))
                .then(function (data) { cb(data.data); }, function(data){});
            },
            getAlertMensaje: function (cb, request) {
                $http.get(api('coberturas/mensajeredflag?vendedor=' + request.vendedor + '&cd_ramo=' + request.cd_ramo + '&cd_prod=&cd_plan=', true))
                .then(function (data) { cb(data.data); }, function(data){});
            },
            getFrecuencias: function (cb, paramsFrecuencias) {
                $http.get(api('frecuenciaDevolucion/getFrecuencia?nu_nup=' + paramsFrecuencias.nu_nup + '&cd_suc=' + paramsFrecuencias.cd_suc + '&cd_ramo=' + paramsFrecuencias.cd_ramo + '&cd_prod=' + paramsFrecuencias.cd_prod + '&cd_plan=' + paramsFrecuencias.cd_plan, true))
                .then(function (data) { cb(data.data); }, function(data){});
            },
            getPromociones: function (cb, paramsPromociones) {
                $http.get(api('nuevaExperiencia/getPromociones?nu_nup=' + paramsPromociones.nu_nup + '&num_doc='+ paramsPromociones.num_doc + '&cd_pro=' + paramsPromociones.cd_pro + '&cd_ramo=' + paramsPromociones.cd_ramo + '&cd_canal=' + paramsPromociones.cd_canal + '&cd_plan=' + paramsPromociones.cd_plan + '&cd_usuario=' + paramsPromociones.cd_usuario, true))
                .then(function (data) { cb(data.data); }, function(data){});
            },
        };
    }]);
})();