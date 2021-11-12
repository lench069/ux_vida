(function () {
    angular.module('cotizaciones')
    .controller('ctrPersonalizar', function ($scope, $mdDialog, $mdToast, pricingRepo, coberturaRequestParams, cotizadorServ){
    	
            pricingRepo.doViviendaPersonalizar(function(coberturaResponse){
                $scope.coberturaVO = coberturaResponse; 
                $scope.mtCuota = $scope.coberturaVO.mtCuota;
                $scope.mtPremio = $scope.coberturaVO.mtPremio;
            }, coberturaRequestParams);
           
            $scope.defaultChecksList = {};
            $scope.defaultAmountList = {};
            $scope.optionalChecksList = {};
            $scope.optionalAmountList = {};

            $scope.calculateMinimumPlan = function(){
                this.applyMinAmounts();
                this.recalcular();
            };
            $scope.calculateSuggestedPlan = function(){
                this.applySuggestedAmounts();
                this.recalcular();
            };
            $scope.applyMinAmounts = function(){
                //Solo se setea monto minimo a los que estan checkeados (tab1 todos por defecto estan todos)
                $scope.coberturaVO.detalleCobertura.forEach(function(item){
                    item.mtSumaAsegurada = item.mtSumaMinima;
                });
                //optionalTab
                var checkedOptionalList = $scope.optionalChecksList;
                $scope.coberturaVO.detalleCoberturaOpcionales.forEach(function(item){
                    if( checkedOptionalList[item.cdCobertura] && (checkedOptionalList[item.cdCobertura]=== true)){
                        item.mtSumaAsegurada = item.mtSumaMinima;
                }
                });
            };
            
            //cdCobertura es el id de cada item
            $scope.applySuggestedAmounts = function(){
                $scope.coberturaVO.detalleCobertura.forEach(function(item){
                    item.mtSumaAsegurada = item.mtSumaSugerida;
                });
                //optionalTab
                var checkedOptionalList = $scope.optionalChecksList;
                $scope.coberturaVO.detalleCoberturaOpcionales.forEach(function(item){
                    if( checkedOptionalList[item.cdCobertura] && (checkedOptionalList[item.cdCobertura]=== true)   ){
                        item.mtSumaAsegurada = item.mtSumaSugerida;
                    }
                });
            };
            
            // Si tiene monto asignado es porque ya habia tildado este item
            $scope.isChecked = function (mtSumaAsegurada) {
                return parseInt(mtSumaAsegurada)>0;
            };
            $scope.setValueOptionalCheckbox = function(itemOptional){
                var optionalCoberturasList = $scope.coberturaVO.detalleCoberturaOpcionales;
                var itemTicked;
                optionalCoberturasList.forEach(function(item){
                    if( item.cdCobertura == itemOptional.cdCobertura   ){
                        itemTicked = item;
                    }
                });
                if ( $scope.optionalChecksList[itemTicked.cdCobertura] && ( $scope.optionalChecksList[itemTicked.cdCobertura] ==true)){
                    //seteo con monto sugerido
                    itemTicked.mtSumaAsegurada = itemTicked.mtSumaSugerida;
                }else{
                    itemTicked.mtSumaAsegurada = 0;
                }
            };

            $scope.recalcular = function(){
            	
            	if($scope.tab == 'i'){
            		var cober = $scope.coberturaVO.detalleCobertura;
            		for (let i = 0; i < cober.length; i++){
            			if((parseInt(cober[i].mtSumaAsegurada) < parseInt(cober[i].mtSumaMinima)) || (parseInt(cober[i].mtSumaAsegurada) > parseInt(cober[i].mtSumaMaxima))){
            				$mdToast.show($mdToast.simple().textContent("Existen valores fuera de los límites inferior y superior.").position("bottom right"));
                    		return;
                    	};
            		};
            	};
            	if($scope.tab == 'o'){
            		var cober = $scope.coberturaVO.detalleCoberturaOpcionales;
            		for (let i = 0; i < cober.length; i++){
            			if($scope.optionalChecksList[cober[i].cdCobertura] == false){ continue;};
            			if((parseInt(cober[i].mtSumaAsegurada) < parseInt(cober[i].mtSumaMinima)) || (parseInt(cober[i].mtSumaAsegurada) > parseInt(cober[i].mtSumaMaxima))){
            				$mdToast.show($mdToast.simple().textContent("Existen valores fuera de los límites inferior y superior.").position("bottom right"));
                    		return;
                    	};
            		};

            	};

                pricingRepo.doViviendaPersonalizar2(function(coberturaResponse){
                    $scope.mtCuota = coberturaResponse.mtCuota;
                    $scope.mtPremio = coberturaResponse.mtPremio;

                    updateAmounts();
                }, $scope.coberturaVO);
            };
            $scope.hide = function () {
                $mdDialog.hide();  
            };
            function isInValidRange(){
                var valid = false;
                return isValid;
            };
            function updateAmounts(){
                var keys = {
                    cdRamo: coberturaRequestParams.cdRamo,
                    cdProducto: coberturaRequestParams.cdProducto,
                    cdPlan: coberturaRequestParams.cdPlan
                };
                var coti = cotizadorServ.getCotizacionByCdRamo(coberturaRequestParams.cdRamo);
                coti.detalleCotizacion.forEach(function(item){
                    if (item.cdProducto == keys.cdProducto && item.cdPlan == keys.cdPlan){
                        item.mtCuota = $scope.mtCuota;
                        item.mtPremio = $scope.mtPremio;
                    }
                });
                cotizadorServ.updateFirstPricing(keys);
            };
             

            $scope.validaMonto = function(index){
            	var cober = $scope.coberturaVO.detalleCobertura[index];
            	if((parseInt(cober.mtSumaAsegurada) < parseInt(cober.mtSumaMinima)) || (parseInt(cober.mtSumaAsegurada) > parseInt(cober.mtSumaMaxima))){
            		$('.monto'+index).addClass('invalid');
            	}else{
            		$('.monto'+index).removeClass('invalid');
            	};
            };
            $scope.validaMontoOp = function(index){
            	var cober = $scope.coberturaVO.detalleCoberturaOpcionales[index];
            	if($scope.optionalChecksList[cober.cdCobertura] == false){ return;};
            	if((parseInt(cober.mtSumaAsegurada) < parseInt(cober.mtSumaMinima)) || (parseInt(cober.mtSumaAsegurada) > parseInt(cober.mtSumaMaxima))){
            		$('.montoOp'+index).addClass('invalid');
            	}else{
            		$('.montoOp'+index).removeClass('invalid');
            };
            };

        });

})();