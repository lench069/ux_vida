(function(){
	angular.module('polizaResume', [])
	.directive('polizaResume', function(){
		return{
			restrict: 'E',
			templateUrl: './src/issue/poliza-resume/poliza-resume.html',
			controller: polizaResumeController
		};
	}).service('resumeServ', function(){
		var ret = function () { };
        var polizaEmit = [];
        var polizaEmitOK = [];
        
        ret.updatePoliza = function(wrappedItem){
        	polizaEmit.forEach(function (item, i) {
                if (item.cdRamo == wrappedItem.cdRamo){
                	polizaEmit[i].asyncIsDone = wrappedItem.asyncIsDone;
                	polizaEmit[i].emitFails = wrappedItem.emitFails;
                	polizaEmit[i].poliza = wrappedItem.poliza;
                	return;
                }
            });
        };
        
        ret.delPoliza = function(cdRamo){
        	var res = this.getPolizaByRamo(cdRamo);
        	var index = polizaEmit.indexOf(res);
        	if(index > -1){
        		polizaEmit.splice(index, 1);
        	}
        };
        ret.setPoliza = function(polizas){ polizaEmit = polizas;};
        ret.addPoliza = function(polizas){ polizaEmit.push(polizas);};
        ret.getPoliza = function(){ return polizaEmit;};
        ret.getPolizaByRamo = function(cdRamo){
        	var res = {};
        	
        	if(cdRamo >= 30 && cdRamo <= 40){
        		cdRamo = 40;
        	}
        	
        	polizaEmit.forEach(function (item, i) {
        		var cdRamoItem = item.cdRamo;
        		if(cdRamoItem >= 30 && cdRamoItem <= 40){
        			cdRamoItem = 40;
            	}
        		
        		if (cdRamoItem == cdRamo){
        			res =  polizaEmit[i];
        		}
        	});
        	return res;
        };
        
        ret.reset = function(){ polizaEmit = [];};
        
        ret.addPolizaOK = function(poliza){
        	
        	var val = false;
        	var cdRamo = poliza.cdRamo;
        	
        	if(cdRamo >= 30 && cdRamo <= 40){
        		cdRamo = 40;
        	}
        	
        	polizaEmitOK.forEach(function (item, i) {
        		var cdRamoItem = item.cdRamo;
        		
        		if(cdRamoItem >= 30 && cdRamoItem <= 40){
        			cdRamoItem = 40;
            	}
        		
        		if (cdRamoItem == cdRamo){
        			val =  true;
        			return;
        		}
        	});
        	
        	if(val){
        		return;
        	} else {
        		polizaEmitOK.push(poliza);
        	}
        };
        
        ret.getPolizaOK = function(){ return polizaEmitOK;};
        
        return ret;
    });
	
	var polizaResumeController = ['$scope', 'formEmitServ', '$mdDialog', 'issueRepo', 'cotizadorServ', '$location', 'resumeServ', 'formsRepo', 'customerServ', function($scope, formEmitServ, $mdDialog, issueRepo, cotizadorServ, $location, resumeServ, formsRepo, customerServ){
		
		var asegurado
		
		var mergeReEmited = function(polizasEmitidas, polizasEmitidasOK){
			var tmpPoliza = [];
			
			for(var i=0; i < polizasEmitidas.length; i++){
				tmpPoliza.push(polizasEmitidas[i]);
			}
			
			for(var i=0; i < polizasEmitidasOK.length; i++){
				tmpPoliza.push(polizasEmitidasOK[i]);
			}
			
			return tmpPoliza;
		};
		
		//--PopUp Feg
		var getRequest = function(index){
			var poli = $scope.polizas[index].poliza;
			var deRamo = $scope.getName(poli.cdRamo);
			
			var requestImpresion = {
	        		idImpresion: '',
            		nmRazon: poli.titular,
            		cdRamo: poli.cdRamo,
            		deRamo: deRamo,
            		nuPoliza: poli.nuPoliza,
            		nuCertificado: poli.nuCertificado,
            		nuPartida: null,
            		renovacion: null,
            		nuEndoso: null,
            		feOperacion: null,
            		cdOperacion: '1001',
            		nuRecibo: null,
            		tpDocum: null,
            		nmDocum: null,
            		cdUsuario: $scope.nmUsuario,
            		cdCanalSuc: '0',
            		seleccion: '',
            		email: null,
            		fax: null
    	        };
			return requestImpresion;
		};
		$scope.showPrint = function(indexCoti){
        	$mdDialog.show({
        		controller: dialogController,
        		templateUrl: './src/issue/poliza-print/poliza-print.html',
        		parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen
        	});
        	$mdDialog.request = getRequest(indexCoti);
            $mdDialog.mailPoliza = {
                    diMail: $scope.polizas[indexCoti].poliza.diMail
                };
		};
        var dialogController = ['$scope', '$mdDialog', function($scope, $mdDialog){
    		$scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.mailPoliza = $mdDialog.mailPoliza;
            
            $scope.aceptar = function () {
            	
            	switch ($scope.option){
            	case 'i':
            		
            		$mdDialog.request.seleccion = 'print';
            		$mdDialog.request.idImpresion = 'poliza';
            		
            		if($mdDialog.request.cdRamo == '30' || $mdDialog.request.cdRamo == '31' || $mdDialog.request.cdRamo == '32'
    					|| $mdDialog.request.cdRamo == '33' || $mdDialog.request.cdRamo == '35'
    					|| $mdDialog.request.cdRamo == '36' /*|| $mdDialog.request.cdRamo == '39'*/) {
                	
                		$scope.printWin = window.open("");
                	}
            		
            		issueRepo.setPrintPoliza(function (data) {
            			var response = data;
            			
            			if($mdDialog.request.cdRamo == '30' || $mdDialog.request.cdRamo == '31' || $mdDialog.request.cdRamo == '32'
            					|| $mdDialog.request.cdRamo == '33' || $mdDialog.request.cdRamo == '35'
            					|| $mdDialog.request.cdRamo == '36' /*|| $mdDialog.request.cdRamo == '39'*/) {
            				
            				if (window.navigator.msSaveOrOpenBlob) {
            					//IE11
                        	} else {
                        		response = response.replace('window.close();', '');
                        	}
            				
            				$scope.printWin.document.write(response);
            				$scope.printWin.redirect();
            			} else {
            				if (window.navigator.msSaveOrOpenBlob) {
                        		var blob = new Blob([data], { type: 'application/pdf' });
                        	    window.navigator.msSaveBlob(blob, 'poliza.pdf');	//IE11
                        	} else {
                        	    var link = angular.element('<a/>');
                        	    link.css({display: 'none'});
                        	    angular.element(document.body).append(link);
        //href: window.URL.createObjectURL(blob) --'data:attachment/csv;charset=utf-8,' + encodeURI(data)
								var blob = new Blob([data], { type: 'application/pdf' });
                        	    link.attr({
                        	        href: window.URL.createObjectURL(blob),
                        	        target: '_blank',
                        	        download: 'poliza.pdf'
	                        	})[0].click();
	                        	link.remove();
                        	}
            			}
            			
            			$scope.printWin = null;
            			
            		}, $mdDialog.request);
            		break;
            	case 'm':
            		//console.log('envio por Mail');
            		if($scope.email == undefined || $scope.email.length == 0){
            			return;
            		}
            		
            		$mdDialog.request.seleccion = 'email';
            		$mdDialog.request.email = $scope.email;
            		$mdDialog.request.idImpresion = 'polizaFile';
            		
            		issueRepo.setPrintPoliza(function (data) {
            			//callback
            		}, $mdDialog.request);
            		
            		break;
            		
            	case 'f':
            		//console.log('envio por Fax');
            		if($scope.fax == undefined || $scope.fax.length == 0){
            			return;
            		}
            		
            		$mdDialog.request.seleccion = 'fax';
            		$mdDialog.request.fax = $scope.fax;
            		$mdDialog.request.idImpresion = 'polizaFile';
            		
            		issueRepo.setPrintPoliza(function (data) {
            			//callback
            		}, $mdDialog.request);
            		
            		break;
            	};
                $mdDialog.hide();
            };

            //verificacion mail
        	$scope.validaMailEstilo = function(){
        		$scope.mailValido=verificarMail($scope.email);
        	};

        }];
        
        $scope.getName = function(cdRamo){
        	var name = null;
        	switch (cdRamo){
        		case '1': name = 'ACCIDENTES PERSONALES'; break;
        		case '18': name = 'VIDA'; break;
        		case '19': name = 'ROBO EN CAJEROS'; break;
        		case '20': name = 'DESEMPLEO/GASTOS PROTEGIDOS'; break;
        		case '21': name = 'VIVIENDA'; break;
        		case '24': name = 'PROTECCION SALUD'; break;
        		case '25': name = 'PROTECCION CARTERA'; break;
        		case '26': name = 'COMPRA PROTEGIDA'; break;
        		default: if(parseInt(cdRamo) >= 30 && parseInt(cdRamo) <= 40){ name = 'AUTO/MOTO';};
        	};
        	return name;
        };
        
        $scope.isNotAutoType = function(cdRamo){
            return cdRamo<30 || cdRamo>40;
        };
        
        $scope.salir = function(){
        	if(confirm("¿Está seguro que desea salir de esta página?")){
	        	formEmitServ.reset();
	        	resumeServ.reset();
	        	cotizadorServ.reset();
	        	customerServ.resetUser();
	        	formsRepo.getLogout(function (data){});
	        	sessionStorage.clear();
	        	window.location.href = window.location.origin + "/menuTree.do";
        	};
        };
        
        $scope.salir2 = function(){
	        sessionStorage.currentPath = $location.path();
	    	sessionStorage.nmUsuario = cotizadorServ.getNmUsuario();
	    	sessionStorage.formPoliza = JSON.stringify(formEmitServ.getPoliza());
        };
    	sessionStorage.resumePoliza = JSON.stringify(resumeServ.getPoliza());
        
        $scope.returnEmitir = function(){
        	$location.url('/issue');
        };
        
        $scope.deleteCotizacion = function(cdRamo){
        	
        	var promis = issueRepo.delCotiEmit(cdRamo);
    		promis.then(function(result){
    			if(result.status == '200'){
    				$scope.cotizadorServ.deleteCotizacion(cdRamo);
    				$scope.cotiRemnant = $scope.cotizadorServ.getCotizaciones().length;
    				
    	        	for(var i=0; i < $scope.polizas.length; i++){
    	        		if($scope.polizas[i].cdRamo == cdRamo){
    	        			$scope.polizas.splice(i, 1);        			
    	        		} else {
    	        			if(parseInt($scope.polizas[i].cdRamo) >= 30 && parseInt($scope.polizas[i].cdRamo) <= 40){
        	        			$scope.polizas.splice(i, 1);        			
        	        		}
    	        		}
    				}
    	        	
    			};
    		}, function(){ 
    			$scope.errorEmit = 'Se produjo un error al eliminar la cotizacion.';
    		});
        };
        
        $scope.valIssueOK = function(item){
        	
        	if(item == undefined) return true;
        	
        	return (item.nuPoliza != undefined && item.nuPoliza.trim().length > 0) &&
			(item.nuCertificado != undefined && item.nuCertificado.trim().length > 0);
        };
        
        window.onunload = function(){
        	$scope.salir2();
        };
        
        window.onbeforeunload = function () {
    	};
    	
    	$scope.sendMail = function(){
    		
    		
    		
    		if( confirm("Esta seguro que quiere reenviar el mail?"))
    		{
    			xmlhttp = new XMLHttpRequest();
    			var productosAux="";
    			$scope.polizas.forEach(function(poliza){
    				productosAux+=poliza.deProducto+","
    			})
    			productos=productosAux.substring(0, str.length - 1);
    			var label="[Reenvio] Alta de Seguro";
    				
    			if($scope.polizas.length > 1)
    				label="[Reenvio] Alta de Seguros";
    						
    			var url = "/Multicotizador/api/digital/check/mail?hash="+$scope.asegurado.hash+"&label="+label+"&products="+productos+"&typeMsg="+"ALTA";
    			xmlhttp.open("POST", url, true);
    			xmlhttp.setRequestHeader("Content-type", "application/json");
    			var body={
    					"nmCli":$scope.asegurado.nmCli,
    					"apeCli":$scope.asegurado.apeCli,
    					"nup":$scope.asegurado.nup
    			}
    			
    			
    			
    			xmlhttp.send(JSON.stringify(body));
    			
    			xmlhttp.onreadystatechange = function() {
    				  if (this.readyState == XMLHttpRequest.DONE) {
    					  if( this.status == 200)
    					  {
    					  	console.log('Reenvio de mail');
    					  	alert("El mail fue reenviado");
    					  } 
    					  else 
    					  {
    						  alert("Error reenviando mail. Intente nuevamente mas tarde.\n\n"+ xmlhttp.responseText);
    						  cosole.log('server error: '+ this.status);
    					  }
    				  }
    				};
    			
    		};
    	}
        
        //INI
    	$scope.polizas = [];
    	$('.loadingSVG').hide();
		$('.container-fluid').removeClass('loadingFx');
		asegurado = customerServ.getUser();
		$scope.asegurado = asegurado;
		
        if(sessionStorage.currentPath != undefined && sessionStorage.currentPath == $location.path()
				&& sessionStorage.nmUsuario != undefined && sessionStorage.formPoliza != undefined 
				&& sessionStorage.resumePoliza != undefined){
			
        	cotizadorServ.setNmUsuario(sessionStorage.nmUsuario);
        	formEmitServ.setPoliza(JSON.parse(sessionStorage.formPoliza));
        	resumeServ.setPoliza(JSON.parse(sessionStorage.resumePoliza));
		}
        
        sessionStorage.clear();
        $scope.cotizadorServ = cotizadorServ;
        $scope.resumeServ = resumeServ;
        $scope.nmUsuario = $scope.cotizadorServ.getNmUsuario() || "";
        $scope.polizas = resumeServ.getPoliza();
        
        $scope.$watch(function(){
            return resumeServ.getPoliza();
        }, function(newPoliza){
        	$scope.polizas = mergeReEmited(resumeServ.getPoliza(), resumeServ.getPolizaOK());
        	$scope.polizas.forEach(function(element) {
        		if(element.asyncIsDone){
        			if($scope.valIssueOK(element.poliza)){
        				resumeServ.delPoliza(element.cdRamo);
        				$scope.cotizadorServ.deleteCotizacion(element.cdRamo);
        				resumeServ.addPolizaOK(element);
        			} else {
        				
        				element.emitFails = true;
        				resumeServ.updatePoliza(element);
        			}
        		}
        	});
        	
        	$scope.cotiRemnant = $scope.cotizadorServ.getCotizaciones().length;
        	
        }, true);
        
	}];
})();