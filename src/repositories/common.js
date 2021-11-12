(function () {
    angular.module('commonRepo', [])
    .factory('commonRepo', ['$http', function ($http) {
        return {

            getAllRamos: function (cb) {
                $http.get(api('menu-ramos'), { headers: { 'Cache-Control': 'no-cache' } })
                .then(function (data) { cb(data.data['menu-ramos']); }, function (data) { });
            },
            getMensajeComercial: function(cb){
            	$http.get(api('cliente/mensajecomercial'))
                .then(function (data) { cb(data.data);}, function (data) {});
          }
            
        };
    }]);
})();