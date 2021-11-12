(function(){
    angular.module('cotizacionesDetail', [])
    .directive('cotizacionesDetail', function(){
        return{
            restrict: 'E',
            templateUrl: './src/pricing/cotizaciones-detail/cotizaciones-detail.html',
            controller: cotizacionesDetailController
        };
    });

    var cotizacionesDetailController = ['$scope', '$routeParams', 'formsRepo', 'pricingRepo', '$mdDialog', 'cotizadorServ', '$location', '$mdToast', 'issueRepo', function ($scope, $routeParams, formsRepo, pricingRepo, $mdDialog, cotizadorServ, $location, $mdToast, issueRepo) {

        var cdRamo = $routeParams.id;
        $scope.filt = {
            aseguradora: '',
            cobertura: ''
        };

        formsRepo.getTpCoberturas(function(data){
            data.shift();//remove extra TODOS value item
            $scope.coberturas = data;
        });
        formsRepo.getCompanias(function(data){
            data.shift();//remove extra TODOS value item
            $scope.aseguradoras = data;
        });
        $scope.recotizarRequested = false;

        //-- Cotizaciones del ramo pasado por parámetro.
        $scope.cotizadorServ = cotizadorServ;
        $scope.cotizaciones = cotizadorServ.getCotizaciones();          
        for (var i = 0; i < $scope.cotizaciones.length; i++){
            if ($scope.cotizaciones[i].cdRamo == cdRamo) {
                $scope.cotizacion = $scope.cotizaciones[i];
            };
        };
        
        $scope.optionCoti = $scope.cotizacion.firstPricing.cdProducto + "-" + $scope.cotizacion.firstPricing.cdPlan;
        //Continuar cotizaciones
        $scope.continuarCoti = function(){
        	var option = $scope.optionCoti;
	        var pos = option.indexOf('-') + 1;
	        var cdProducto = option.substring(0, pos - 1);
	        var cdPlan = option.substring(pos, option.lenght);
	        var keys = {
	        		cdRamo: $routeParams.id,
	        		cdProducto: cdProducto,
	        		cdPlan: cdPlan
	        };

            var detailObj = $.grep($scope.cotizacion.detalleCotizacion, function(item){
                return (item.cdProducto == keys.cdProducto) && (item.cdPlan == keys.cdPlan);
            });
			if(cotizadorServ.verificoActividadesNoAseguradas(detailObj[0].cdRamo)){
				return;
			}
        	if ($scope.recotizarRequested){
                $scope.cotizacion.firstPricing = detailObj[0];
                $scope.cotizacion.selCotizacion = detailObj[0];
                cotizadorServ.updateCotizacion($routeParams.id, $scope.cotizacion);
            }else {
                cotizadorServ.updateFirstPricing(keys);
            }
        	$location.url('/pricing');
        };

        //---Coberturas
        $scope.showPopup = function (ev, cotiDetalle) {
            $mdDialog.show({
                controller: coberturasController,
                templateUrl: './src/pricing/coberturas/coberturas.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen
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
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.producto = $mdDialog.producto;
            pricingRepo.getCobertura(function (data) { $scope.cobertura = data;}, $mdDialog.request);
        }];

        //--Recotizar
        $scope.recotizar = function(){
            var currentCotizacion = $scope.cotizacion;
            var params = {
                mtSumaAseg: $scope.newMtSumAseg,
                cdRamo: currentCotizacion.cdRamo,
                tpCobertura: currentCotizacion.tpCobertura,
                cdClaseRiesgo: currentCotizacion.cdClaseRiesgo
            };
            pricingRepo.getCotizacionNormalRecotizar(function(result){
                $scope.recotizarRequested = true;
                var res = {
                    limits: $scope.cotizacion.limits,
                    asyncIsDone: $scope.cotizacion.asyncIsDone
                };
                $scope.cotizacion = angular.extend(res, result);
                $scope.optionCoti = $scope.cotizacion.firstPricing.cdProducto + "-" + $scope.cotizacion.firstPricing.cdPlan;
            }, params);
        };

        $scope.isNotAutoType = function(){
            var ramoNumber = parseInt($scope.cotizacion.cdRamo);
            return ramoNumber<30 || ramoNumber>40;
        };

        $scope.isAutoInspeccion = function(cotiDetalle){
            var cdRamo = parseInt(cotiDetalle.cdRamo);
        	var inInsp = cotiDetalle.inInspeccion;
            return (cdRamo >= 30 && cdRamo <= 40 && inInsp == 'S');
        };

        $scope.isBasicRamoType = function(){
            var ramoNumber = parseInt($scope.cotizacion.cdRamo);
            //only available in Vida, vivienda, AccPersonales
            return [1,18,21].indexOf(ramoNumber)>=0;
        };

        $scope.isProtPago = function(cotiDetalle){
            var cdRamo = parseInt(cotiDetalle.cdRamo);
            var cdClaseProd = cotiDetalle.cdClaseProd;
            return ([18,20].indexOf(cdRamo)>=0 && cdClaseProd == "PP");
        };

        $scope.isProtPagoPremio = function(tipo){
            var res = false;
            var tex = null;
        	var cdRamo = null;
            var cdClaseProd  = null;
        	var coti = $scope.cotizacion.detalleCotizacion;
        	for (let i = 0; i < coti.length; i++){
            	cdRamo = parseInt(coti[i].cdRamo);
                cdClaseProd = coti[i].cdClaseProd;
                if ([18,20].indexOf(cdRamo)>=0 && cdClaseProd == "PP") {
                	tex = coti[i].dePremioPp;
                	res = true;
                	break;
                };
        	};
        	if (tipo == "texto") {
        		return tex;
        	} else {
        		return res;
        	}
        };

        $scope.isNotProtPago = function(cotiDetalle){
            var cdRamo = parseInt(cotiDetalle.cdRamo);
            var cdClaseProd = cotiDetalle.cdClaseProd;
            return !([18,20].indexOf(cdRamo)>=0 && cdClaseProd == "PP");
        };

        //--Comparar
        $scope.itemsToCompareCount = [];
        $scope.checkboxList = [];
        $scope.addItemToCompare = function(index, detalleItem){
        	if($scope.checkboxList[index]){
        		if ($scope.itemsToCompareCount.length < 3){
                        $scope.itemsToCompareCount.push(1);
                }else {
                    $scope.checkboxList[index] = false;
                    $mdToast.show($mdToast.simple().textContent("Como máximo se pueden seleccionar 3 elementos").position("bottom right"));
                };
        	}else{
                $scope.itemsToCompareCount.splice(0,1);
        	};
        };

        $scope.resetChecks = function(){
            $scope.itemsToCompareCount = [];
            $scope.checkboxList = [];
        };

        $scope.comparePlans = function(){
            if ($scope.itemsToCompareCount.length < 2){
                $mdToast.show($mdToast.simple().textContent("Debe elegir al menos 2 planes.").position("bottom right"));
            }else {
            	var request = {};
            	$scope.itemsToCompare = [];
            	var coti = $scope.cotizacion.detalleCotizacion;
            	var j = 0;
            	var paso = false;
            	var index = -1;
            	for (let i = 0; i < coti.length; i++){
            		if ($scope.filt.aseguradora == '' && $scope.filt.cobertura == ''){
            			paso = true;
            			index++;
            		} else if ($scope.filt.aseguradora == coti[i].cdRamo && $scope.filt.cobertura == ''){
            			paso = true;
            			index++;
            		} else if ($scope.filt.aseguradora == '' && $scope.filt.cobertura == coti[i].cdCategPlan){
            			paso = true;
            			index++;
            		} else if ($scope.filt.aseguradora == coti[i].cdRamo && $scope.filt.cobertura == coti[i].cdCategPlan){
            			paso = true;
            			index++;
            		}
            		request = {};
            		if($scope.checkboxList[index] && paso){
            			$scope.itemsToCompare.push(coti[i]);
                		$scope.itemsToCompare[j].cobertura = [];
	            		request = {
	                    	cdProd: coti[i].cdProducto,
	                        cdRamo: coti[i].cdRamo,
	                        cdPlan: coti[i].cdPlan,
	                        nuCoti: coti[i].nuCotizacion,
	                        cdSuc: coti[i].cdSucursal
	                    };
            			pricingRepo.getCobertura(function (data) { $scope.itemsToCompare[j].cobertura = data; j++;}, request);
            		};
            	};
                $mdDialog.show({
                    controller: ctrlCompare,
                    locals: {
                        dataList: $scope.itemsToCompare, 
                    },
                    templateUrl: './src/pricing/cotizaciones-detail/comparar.html',
                    clickOutsideToClose: true
                });
             };
        };

        //--Imprimir cotizacion
        $scope.imprCotizacion = function(coti){
        	issueRepo.setPrint(function (data) {}, coti);
        };

    }];

    function ctrlCompare($scope, $mdDialog, dataList){
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

})();