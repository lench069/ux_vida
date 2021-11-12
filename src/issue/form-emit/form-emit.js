(function(){
	angular.module('formEmit', ['ngSanitize'])
	.directive('formEmit', function(){
		return{
			restrict: 'E',
			templateUrl: './src/issue/form-emit/form-emit.html',
			controller: datosAseguradoController,
			replace: true
		};
	}).service('formEmitServ', function(){
		var ret = function () { };
        var polizaEmit = [];
        var polizasSend = [];
        var polizaOld = {
            	cdProvincia:"", cdCiudad:"", cdPostal:"", nuTelefono:"", diMail:"", polizaDigital:"",
            	origenFondosDDJJ:"", inPep:"", cargoPep:"", funcPubExt:"", militaryProd:"", mtIngresos:"",
            	nroPoliza:"", nroCertificado:"", errNumber:"", errMensaje:"",
            	cdPaisNacimiento: "", cdPaisNacionalidad: "",
            	formaPago:{
            		  tpCuentaBco: "", cdSucCta: "", ctaTarjetaRector: "", stTarjeta: "", nuCBU:"", moneda: "", ctaTarjetaFormato: "", ctaTarjetaFormatoProtegido: "",
            	      tpCtaRector: "", deTpCtaRector: "", cdCtaRector: "", inCtaRector: "", cdTitularidad: "", nroCtaContrato: ""
            	},
            	feIncripcionRegistral:"", nuIncripcionRegistral:"", feConstitucion:"",	//Exclusivo empresas
            	feVigenciaNormal:"", feVigenciaAutos:"",
            	domCalleViv:"", domDeptoViv:"", domNroViv:"", domPisoViv:"", entreCallesViv:"", alarmaViv:"",	//Vivienda
            	tarjetasAseguradasRC: [], tarjetasAseguradasCP: [], tarjetasAseguradasPP: [],	//Robo Cajy Compra Prot
            	nuDJS:"",				//Vida
            	domCalleAuto:"", domDeptoAuto:"", domNroAuto:"", domPisoAuto:"", 
            	nuChasis:"", nuMotor:"", nuPatente:"", telInspec: "", kilometraje:"",
            	nuOblea:"", cdMarcaRegulador:"", tallerMontaje:"", nuSerie:"", feDesdeGNC:"", feHastaGNC:"",
            	cilindros: [],
            	beneficiarios: []
            };
        var medioPagoOld = { origFondo: '', motivo: '', ingresos: '', cuentaSantander: '', tarjOtroBanco: '', tarjOtroBancoNro: '', cuentaOtroBancoCbu: ''};
        var beneficiarios = [];
        
        
        
        ret.setBenefOld = function(data){ beneficiarios = data;};
        ret.getBenefOld = function(){ return beneficiarios;};
        
        ret.setPolizaOld = function(poliza){ polizaOld = poliza;};
        ret.getPolizaOld = function(){ return polizaOld;};
        
        ret.setMedioPagoOld = function(medPago){ medioPagoOld = medPago;};
        ret.getMedioPagoOld = function(){ return medioPagoOld;};
        
        ret.setPoliza = function(poliza){ polizaEmit = poliza;};
        ret.addPoliza = function(poliza){ 
        	polizaEmit.push(poliza);
        };
        ret.getPoliza = function(){ return polizaEmit;};
        ret.updatePoliza = function(cdRamo, poliza){
        	polizaEmit.forEach(function (item, i) {
                if (item.cdRamo == cdRamo){
                	polizaEmit[i].asyncIsDone = true;
                	polizaEmit[i].poliza = poliza;
                }
            });
        };
        ret.reset = function(){
        	polizaEmit = {};
            polizasSend = [];
            polizaOld = {};
            medioPagoOld = {};
            beneficiarios = [];
        };
        return ret;
    });
	
	var datosAseguradoController = ['$scope', '$timeout', 'formsRepo', 'customerServ', 'issueRepo', 'cotizadorServ', '$location', 'formEmitServ', '$mdDialog', 'resumeServ', function($scope, $timeout, formsRepo, customerServ, issueRepo, cotizadorServ, $location, formEmitServ, $mdDialog, resumeServ){
		
		//---------DATOS ASEGURADO	
		
		//private var
		var documentos;
		var asegurado;
		var poliza = {};
		var tarjetasAsegCP = {};
		var tarjetasAsegPP = {};
		var tarjetasAsegRC = {};
		var descDoc;
		var paramAceptacionVidaValidate = {};		
		
		//scope var
    	$scope.conMailAutos = true;
		$scope.autonomo = false;
		$scope.isVerificaDigital = false;
		$scope.sexos = [];
		$scope.estadosCiviles = [];
		$scope.paises = [];
		
		$scope.provincias = [];
		$scope.localidades = [];
		$scope.provinciasAut = [];
		$scope.localidadesAut = [];
		$scope.flagAllow="true";
		$scope.ramosAllow="";
		$scope.canalesNotAllow="977,992,990,914,999,979,975,974,973,998,28,7";
		$scope.tpDocsNotAllow="L,T";
		$scope.clientMail="";
		
		formsRepo.getAceptacionDigitalActive(function (data){$scope.flagAllow=data[0].valor});
		
		formsRepo.getAceptacionDigitalRamos(function (data){$scope.ramosAllow=data[0].valor});
        
        formsRepo.getAceptacionDigitalCanales(function (data){$scope.canalesNotAllow=data[0].valor});
        
        formsRepo.getAceptacionDigitalDocs(function (data){$scope.tpDocsNotAllow=data[0].valor});
		
        formsRepo.getAllProvincias(function(data){ $scope.provincias = data; });
        formsRepo.getAllProvincias(function(data){ $scope.provinciasAut = data; });
		
		$scope.stepId = $scope.stepId || 1;
		
		 $scope.showAlert = function() {
			    // Appending dialog to document.body to cover sidenav in docs app
			    // Modal dialogs should fully cover application
			    // to prevent interaction outside of dialog
			    $mdDialog.show(
			      $mdDialog.alert()
			        .parent(angular.element(document.querySelector('#popupContainer')))
			        .clickOutsideToClose(true)
			        .title('ATENCION!')
			        .htmlContent(
			        		'<p>El mail ingresado es diferente al que se encuentra en Mensajes y Avisos.</p>'+
			        		'<p></p>'+
			        		'<ul><b>Mail Ingresado:</b>   '+$scope.asegurado.diMail +'</ul>'+
			        		'<ul><b>Mail Mensajes y avisos:</b>   '+$scope.clientMail +'</ul>'+
			        		'<p></p>'+
			        		'<p></p>'+
			        		'<p> <b>*En caso de haber actualizado el mail en "+Che", el mismo puede tardar 24 hrs en reflejarse aquí.</b></p>'
			        		)
			        .ok('OK')
			    );
			  };
		//
		//--------DDJJ y MEDIOS DE PAGO
        $scope.origenFondos = [];
        $scope.cuentas = [];
        $scope.tarjetasOtros = [];
        $scope.ctasBcoFlag = false;
        $scope.otroBoFlag = false;
        $scope.cbuFlag = false;
        $scope.filtroMedioPago = {};
        $scope.medioPago = formEmitServ.getMedioPagoOld();
        $scope.endpointAd = '';
        window.onunload = function(){
        	$scope.salir2();
        };

		window.onbeforeunload = function (e){
    	};
    	
    	$scope.isAceptacionDigital=true;
    	
    	
    	//private functions
    	var rememberCheckedCards = function(oldEmitCardList, actualEmitCardList){
    		
    		if(oldEmitCardList != undefined){
				
				for(var i = 0; i < oldEmitCardList.length; i++){
					
					var oldTarjCP = oldEmitCardList[i];
					
					for(var j = 0; j < actualEmitCardList.length; j++){
						
						if(actualEmitCardList[j].tpCtaRector == oldTarjCP.tpCtaRector &&
								actualEmitCardList[j].ctaTarjetaRector == oldTarjCP.ctaTarjetaRector &&
								actualEmitCardList[j].mensaje == ''){
							
							actualEmitCardList[j].check = true;
						}
					}
				}
			}
    		return actualEmitCardList;
    	};
    	
    	var allowDigitalVerify = function allowDigitalVerify(channel)
		{
			var docTypeExclude = $scope.tpDocsNotAllow.split(",");
			var channelsExclude	= $scope.canalesNotAllow.split(",");
			var ramos=$scope.ramosAllow.split(",");
			var foundDoc=false;
			var foundChannel=false;
			
			docTypeExclude.forEach(function (element){
				
				if(element == $scope.asegurado.tpDoc)
					foundDoc=true;
				
			});
			
			channelsExclude.forEach(function (element){
				
				if(element == channel)
					foundChannel=true;
				
			});

			
			var isRamo=true;
			$scope.cotizaciones.forEach(function (coti){	
				
				var foundRamo=false;
				if("40"===coti.cdRamo){
					ramos.forEach(function (element){
						if(element == coti.selCotizacion.cdRamo)
							foundRamo=true;
					});
				}else{
					ramos.forEach(function (element){
						if(element == coti.cdRamo)
							foundRamo=true;						
					});
				}
				
				if(foundRamo==false)
					isRamo=false;
			});
			
			var notClient=false;
			if($scope.cotizaciones[0].nuNup == undefined || $scope.cotizaciones[0].nuNup == '0')
				notClient=true
			
			
			if(foundDoc || foundChannel || !$scope.persFisica || $scope.flagAllow!="true" || !isRamo || notClient)
				return false;
			
			return true
		};
    	
		var afterStep1 = function(){
			
			$scope.cotizaciones = cotizadorServ.getCotizaciones();
			
			issueRepo.getAceptacionDigitalEndpoint(function(data){ 
				$scope.endpointAd = data;				
			});
			issueRepo.getAllOrigenFondos(function(data){ 
				$scope.origenFondos = data;
				$scope.medioPago.origFondo = $scope.medioPago.origFondo || data[0].valor;
				
			});
			
			getMedioPago();

			$timeout(function(){
				$scope.finish2 = true;
				$('.loadingSVG').hide();
				$('.container-fluid').removeClass('loadingFx');
			});
			
		};
		
		
        /*-----------autocomplete-------------*/
        $scope.querySearch = function querySearch(query, list) {
            var results = query ? $scope[list].filter(function (el) {
                return el.descripcion.toUpperCase().indexOf(query.toUpperCase()) > -1;
            }) : $scope[list], deferred;
            return results;
        };
        
        $scope.selectedItemChange = function selectedItemChange(item, obj, attr) {
            if (item != undefined) {
            	$scope[obj][attr] = item;
            	if(attr == 'cdProvincia'){
            		$scope.searchTextLocalidad = '';
            		formsRepo.getLocalidadesByProv(function (data) { $scope.localidades = data;}, $scope[obj][attr]);
            	};
            };
        };
        /*------------------------------------*/
        
        
        var filtraCuentas = function(cdRamo, cdProducto, filtro){
        	
        	var valCta = false;
        	
        	var requestCuentas = {
	        		cdRamo: cdRamo,
	        		cdProd: cdProducto
	        };
        	
        	issueRepo.getAllCuentas(function (data) {
        		
        		$.each(data, function(c, itemc){
        			
        			var valUnique = false;
        			valCta = filtro.indexOf(itemc.tpCtaRector) > -1;
        			
        			if(valCta){
        				
        				$.each($scope.cuentas, function(index, cuenta){
    	        			if(cuenta.ctaTarjetaRector == itemc.ctaTarjetaRector){valUnique = true;}
    	        		});
        				
        				if(!valUnique){$scope.cuentas.push(itemc);}
        			}
        		});
        		
        		
        		$scope.ctasBcoFlag = $scope.cuentas.length > 0;
        		
    			if($scope.ctasBcoFlag && ($scope.medioPago.optionFormaPago == undefined || $scope.medioPago.optionFormaPago == '1') && ($scope.medioPago.cuentaSantander == undefined || $scope.medioPago.cuentaSantander == '')){
        			$scope.medioPago.cuentaSantander = $scope.cuentas[0].ctaTarjetaRector;        			
        		}
    			
        	}, requestCuentas);
        	
        };
        
        var getMedioPago = function(){
        	
	        issueRepo.getMedioPago(function (data) {
	        	
	        	var optionFormaPago = '';
	        	$scope.filtroMedioPago = data.data;
	        	
	        	if($scope.filtroMedioPago.OTR == undefined){
	        		$scope.otroBoFlag = false;
	        	} else {
	        		$scope.tarjetasOtros = $scope.filtroMedioPago.OTR;
	        		$scope.otroBoFlag = true;
	        	}
	        	
	        	if($scope.filtroMedioPago.CBU == undefined){
	        		$scope.cbuFlag = false;
	        	} else {
	        		$scope.cbuFlag = true;
	        	}
	        	
	        	if($scope.filtroMedioPago.BCO == undefined || $scope.asegurado.cuentas == undefined || $scope.asegurado.cuentas.length == 0){
	        		$scope.ctasBcoFlag = false;
	        		
	        		if($scope.otroBoFlag){
	        			optionFormaPago = '2';
	        		} else if ($scope.cbuFlag) {
	        			optionFormaPago = '3';
	        		} else {
	        			alert("No hay ningun medio de pago disponible comun a los productos seleccionados");
	        			$location.url('/');
	        		}
	        		
	        	} else {
	        		optionFormaPago = '1';
	        		
	        		var listTipos = [];
	        		$.each($scope.filtroMedioPago.BCO, function(i, item){
	        			listTipos.push(item.tipo);
	        		});
	        		
	        		$.each($scope.cotizaciones, function(i, item){
	        			if (item.cdClaseRiesgo == 'AUT') {
		        			filtraCuentas(18, item.selCotizacion.cdProducto, listTipos);
	        			} else {
		        			filtraCuentas(item.selCotizacion.cdRamo, item.selCotizacion.cdProducto, listTipos);
	        			}
	        		});
	        		
	        	}
	        	
	        	$scope.medioPago.optionFormaPago = $scope.medioPago.optionFormaPago || optionFormaPago;
	        });
        };
        
        var afterStep2 = function(){
	        $scope.errorEmit = '';
	        $scope.vigencias = [];
	        $scope.vigenciasAuto = [];
	        $scope.viviendas = [];
	        $scope.parentescos = [];
	        $scope.marcas = [];
	        $scope.modelos = [];	
	        $scope.tarjetasAsegRC = [];
	        $scope.tarjetasAsegCP = [];
	        $scope.tarjetasAsegPP = [];
	        $scope.poliza = {};
	        
	        $scope.polizaEmitOld = formEmitServ.getPolizaOld();
	        poliza.beneficiarios = $scope.polizaEmitOld.beneficiarios;
	        $scope.poliza.cilindros = $scope.polizaEmitOld.cilindros;
	        $scope.cotizaciones = cotizadorServ.getCotizaciones();
	        	
	        $scope.polizaEmit = formEmitServ.getPolizaOld();
			
	        iniCotiz();
        };
        
        var setVigencia = function(cdRamo){
        	if($scope.vigencias.length == 0){
        		issueRepo.getVigencia(function (data) {
        			$scope.vigencias = data.data;
        		}, {cdRamo:cdRamo, nuFlota:$scope.poliza.nuFlota});
        	};
        };
        
        var setVigenciaAuto = function(cdRamo){
        	if($scope.vigencias.length == 0){
        		issueRepo.getVigencia(function (data) {
        			$scope.vigenciasAuto = data.data;
        		}, {cdRamo:cdRamo, nuFlota:$scope.poliza.nuFlota});
        	};
        };
        
        var initBeneficiarios = function(limit, poliza){
        	
        	formsRepo.getAllParentescos(function (data) {
        		
        		$scope.parentescos = data;
        		
	        	if(poliza.beneficiarios == undefined || poliza.beneficiarios.length == 0){
	        		poliza.beneficiarios = [];
	        		for(var i=0; i<limit; i++){ poliza.beneficiarios.push({nmBeneficiario:'', tpDoc:'', nuDoc:'', tpParentezco:'', nuParticipacion:''});};
	        	} else {
	        		for(var i = 0; i < limit; i++){
	        			if(poliza.beneficiarios[i] == undefined){
	        				poliza.beneficiarios.push({nmBeneficiario:'', tpDoc:'', nuDoc:'', tpParentezco:'', nuParticipacion:''});
	        			};
	        		};
	        	};
        	 });
        };
        
        var iniCotiz = function(){
        	
	        var coti = {};
	        var listCotis = $scope.cotizaciones;
	        var tmpCdSuc = "";
	        var tmpNuFlota = "";
	        
	        poliza.valAuto = false;
	        poliza.valNormal = false;
	        poliza.countPolizas = 0;
	        
	        
	        for(var i in listCotis){
	        	
	        	coti = listCotis[i];
	        	tmpCdSuc = coti.cdSuc;
	        	tmpNuFlota = coti.nuFlota;
	        	switch(coti.cdRamo) {
		        	case '1': //acc. personales
		        		initBeneficiarios(5, poliza);
		        		poliza.accPersonales = {
		        				cdRamo: '1',
		        				selCotizacion: coti.selCotizacion
		        		};
		        		
		        		poliza.countPolizas += 1;
		        		poliza.valNormal = true;
		                break;
		        	case '18'://Vida
		        		initBeneficiarios(5, poliza);
		        		poliza.vida = {
		        			cdRamo: '18',
		        			selCotizacion: coti.selCotizacion,
		        			nuDJS: ''
		        		};
		        		
		        		poliza.vida.nuDJS = $scope.polizaEmitOld.nuDJS || poliza.vida.nuDJS;
		        		
		        		poliza.countPolizas += 1;
		        		poliza.vida.isDjsProd = coti.selCotizacion.inDjsProd == "S";
		        		poliza.valNormal = true;
		                break;  
		        	case '19'://robo en cajeros
		        		initBeneficiarios(5, poliza);
		        		poliza.robo = {
		        				cdRamo: '19',
		        				selCotizacion: coti.selCotizacion
		        		};
		        		
		        		poliza.countPolizas += 1;
		        		issueRepo.getTarjetasByRamo(function(data){ 
		        			tarjetasAsegRC = data;
		        			poliza.robo.isTarjetasAseg = tarjetasAsegRC.length > 0;
		        			
		        			for(var i=0; i < tarjetasAsegRC.length; i++){
		        				tarjetasAsegRC[i].check = false;
		        			};
		        			
		        			$timeout(function(){
		        				var correctedEmit = formEmitServ.getPolizaOld();
		            			
		            			$scope.tarjetasAsegRC = rememberCheckedCards(correctedEmit.tarjetasAseguradasRC, tarjetasAsegRC);
		        			}, 100);
		        			
		        		}, coti.selCotizacion.cdRamo);
		        		
		        		poliza.valNormal = true;
		                break;
		        	case '20'://desempleo
		        		initBeneficiarios(5, poliza);
		        		poliza.desempleo = {
		        				cdRamo: '20',
		        				selCotizacion: coti.selCotizacion
		        		};
		        		
		        		poliza.countPolizas += 1;
		        		poliza.valNormal = true;
		        		poliza.desempleo.isPP = poliza.desempleo.selCotizacion.cdClaseProd == "PP";
		        		
		        		issueRepo.getTarjetasByRamo(function(data){ 
		        			tarjetasAsegPP = data;
		        			poliza.desempleo.isTarjetasAseg = tarjetasAsegPP.length > 0;
		        			
		        			for(var i=0; i < tarjetasAsegPP.length; i++){
		        				tarjetasAsegPP[i].check = false;
		        			};
		        			
		        			$timeout(function(){
		        				var correctedEmit = formEmitServ.getPolizaOld();
		            			
		            			$scope.tarjetasAsegPP = rememberCheckedCards(correctedEmit.tarjetasAseguradasPP, tarjetasAsegPP);
		            			
		        				$scope.autonomo = (coti.cdClaseRiesgo == 'AUT') ? true : false;
		        			}, 100);
		        			
		        		}, coti.selCotizacion.cdRamo);
		        		
		        		
		                break;
		            case '21'://Vivienda
		            	$scope.localidadesViv = [];
		            	poliza.vivienda = {
		        				cdRamo: '21',
		            			selCotizacion: coti.selCotizacion,
		    	            	tpCobertura: coti.tpCobertura,
								cdProvincia: coti.cdProvincia,
								deProvincia: coti.deProvincia,
								cdLocalidad: coti.cdLocalidad,
								deLocalidad: coti.deLocalidad,
		    	            	cdPostal: coti.cdPostal,
		    	            	codPos: coti.cdLocalidad,
		    	            	domCalle: '',
		    	            	entreCalles: '',
		    	            	alarma: '',
		            	};
	
		            	try {
		        	        formsRepo.getLocalByProv(function(data){ $scope.localidades = data; }, poliza.vivienda.cdProvincia);

		        	        var localidadExt = $scope.asegurado.cdCiudad.split('|');
		            		if (poliza.vivienda.cdProvincia == $scope.asegurado.cdProvincia && poliza.vivienda.cdLocalidad == localidadExt[0]) {
			            		poliza.vivienda.domCalle = $scope.polizaEmitOld.domCalleViv || $scope.asegurado.domCalle;
			            		poliza.vivienda.domNro   = $scope.polizaEmitOld.domNroViv || $scope.asegurado.domNro;
			            		poliza.vivienda.domDepto = $scope.polizaEmitOld.domDeptoViv || $scope.asegurado.domDepto;
			            		poliza.vivienda.domPiso  = $scope.polizaEmitOld.domPisoViv || $scope.asegurado.domPiso;
		            		} else {
		            			poliza.vivienda.domCalle = $scope.polizaEmitOld.domCalleViv || "";
			            		poliza.vivienda.domNro   = $scope.polizaEmitOld.domNroViv || "";
			            		poliza.vivienda.domDepto = $scope.polizaEmitOld.domDeptoViv || "";
			            		poliza.vivienda.domPiso  = $scope.polizaEmitOld.domPisoViv || "";
		            		};
		            		poliza.vivienda.entreCalles = $scope.polizaEmitOld.entreCallesViv || "";
		            		poliza.vivienda.alarma      = $scope.polizaEmitOld.alarmaViv || "";
	            		} catch (e) {};
	
		            	poliza.countPolizas += 1;
		            	poliza.valNormal = true;
		                break;
		            case '22'://Integral de comercio
		            	poliza.intComercio = {
	        				cdRamo: '22',
		            		selCotizacion: coti.selCotizacion
		            	};
		            	
		            	poliza.countPolizas += 1;
		            	poliza.valNormal = true;
		                break;
		            case '24'://Proteccion salud
		            	poliza.protSalud = {
	        				cdRamo: '24',
		            		selCotizacion: coti.selCotizacion
		            	};
		            	
		            	poliza.countPolizas += 1;
		            	poliza.valNormal = true;
		                break;
		            case '25'://Proteccion cartera
		            	poliza.protCartera = {
	        				cdRamo: '25',
		            		selCotizacion: coti.selCotizacion
		            	};
		            	
		            	poliza.countPolizas += 1;
		            	poliza.valNormal = true;
		                break;    
		            case '26'://Compra protegida
		            	poliza.compraProt = {
	        				cdRamo: '26',
		            		selCotizacion: coti.selCotizacion
			            };
		            	
		            	poliza.countPolizas += 1;
		            	issueRepo.getTarjetasByRamo(function(data){
		            		tarjetasAsegCP = data;
		            		poliza.compraProt.isTarjetasAseg = tarjetasAsegCP.length > 0;
		            		
		            		for(var i=0; i < tarjetasAsegCP.length; i++){
		            			tarjetasAsegCP[i].check = false;
		            		};
		            		
		            		$timeout(function(){
		            			var correctedEmit = formEmitServ.getPolizaOld();
		            			
		            			$scope.tarjetasAsegCP = rememberCheckedCards(correctedEmit.tarjetasAseguradasCP, tarjetasAsegCP);
		            			
		            		}, 100);
		            		
		            	}, coti.selCotizacion.cdRamo);
		            	
		            	poliza.valNormal = true;
		                break;
		            case '40':
		            	$scope.descMarca = coti.deMarca;
		            	$scope.descModelo = coti.deModelo;
		            	poliza.autos = {
		        			cdRamo: '40',
		            		selCotizacion: coti.selCotizacion,
	    	            	cdProvincia: coti.cdProvincia,
	    	            	cdLocalidad: coti.cdLocalidad,
	    	            	cdPostal: coti.cdPostal,
	    	            	codPos: coti.cdLocalidad,
		            		marca: coti.cdMarca,
		            		anoFabr: coti.nuAnio,
		            		modelo: coti.cdModelo + '|' + coti.mtSumaAseg,
		            		tpGnc: coti.tpGnc,
		            		cilindros: []
		            	};
		            	
		            	try {
		        	        formsRepo.getLocalByProv(function(data){ $scope.localidadesAut = data; }, poliza.autos.cdProvincia);

		            		var localidadExt = $scope.asegurado.cdCiudad.split('|');
		            		if (poliza.autos.cdProvincia == $scope.asegurado.cdProvincia && poliza.autos.cdLocalidad == localidadExt[0]) {
			            		poliza.autos.domCalle = $scope.polizaEmitOld.domCalleAuto || $scope.asegurado.domCalle;
			            		poliza.autos.domNro   = $scope.polizaEmitOld.domNroAuto || $scope.asegurado.domNro;
			            		poliza.autos.domDepto = $scope.polizaEmitOld.domDeptoAuto || $scope.asegurado.domDepto;
			            		poliza.autos.domPiso  = $scope.polizaEmitOld.domPisoAuto || $scope.asegurado.domPiso;
		            		} else {
		            			poliza.autos.domCalle = $scope.polizaEmitOld.domCalleAuto || "";
			            		poliza.autos.domNro   = $scope.polizaEmitOld.domNroAuto || "";
			            		poliza.autos.domDepto = $scope.polizaEmitOld.domDeptoAuto || "";
			            		poliza.autos.domPiso  = $scope.polizaEmitOld.domPisoAuto || "";
		            		};
		            		
		            		poliza.autos.nuPatente  = $scope.polizaEmitOld.nuPatente || "";
		            		poliza.autos.nuChasis  = $scope.polizaEmitOld.nuChasis || "";
		            		poliza.autos.nuMotor  = $scope.polizaEmitOld.nuMotor || "";
		            		poliza.autos.km  = $scope.polizaEmitOld.kilometraje || "";
		            		poliza.autos.telInspec  = $scope.polizaEmitOld.telInspec || "";
		            		
		            		poliza.autos.nuObleaGnc  = $scope.polizaEmitOld.nuOblea || "";
		            		poliza.autos.tallerMonGnc  = $scope.polizaEmitOld.tallerMontaje || "";
		            		poliza.autos.marcaRegGnc  = $scope.polizaEmitOld.cdMarcaRegulador || "";
		            		poliza.autos.nuSerieGnc  = $scope.polizaEmitOld.nuSerie || "";
		            		
		            		if($scope.polizaEmitOld.feDesdeGNC != undefined && $scope.polizaEmitOld.feDesdeGNC != ""){
		            			poliza.autos.feDesdeGnc = moment($scope.polizaEmitOld.feDesdeGNC).toDate();	
		            		} else {
		            			poliza.autos.feDesdeGnc = undefined;
		            		}
		            		
		            		if($scope.polizaEmitOld.feHastaGNC != undefined && $scope.polizaEmitOld.feHastaGNC != ""){
		            			poliza.autos.feHastaGnc  = moment($scope.polizaEmitOld.feHastaGNC).toDate();	
		            		} else {
		            			poliza.autos.feHastaGnc  = undefined;	
		            		}
		            		
		            	} catch (e) {};
	
		            	poliza.countPolizas += 1;
		            	poliza.valAuto = true;
		            	
		            	for(var i=0; i < 4; i++){
		            		if($scope.poliza.cilindros[i] == undefined){
		            			poliza.autos.cilindros.push({cdMarcaCilindro:'', nuSerieCilindro:'', feVigenciaCilindro:''});
		            		} else {
		            			var tmpCilindro = {
		            					cdMarcaCilindro: $scope.poliza.cilindros[i].cdMarcaCilindro,
		            					nuSerieCilindro: $scope.poliza.cilindros[i].nuSerieCilindro,
		            					feVigenciaCilindro: moment($scope.poliza.cilindros[i].feVigenciaCilindro).toDate()
		            				};
		            			
		            			poliza.autos.cilindros.push(tmpCilindro);
		            		}
		            	};
		                break;
		            default:
		                break;
		        };
		        

	        };
	        
	        if(poliza.valNormal){
	        	setVigencia(coti.selCotizacion.cdRamo);
	        }
	        if(poliza.valAuto){
	        	setVigenciaAuto(coti.selCotizacion.cdRamo);
	        }
	        
	        poliza.sucCoti = tmpCdSuc +' - '+ tmpNuFlota;
	        poliza.nuFlota = tmpNuFlota;
	        formEmitServ.setPoliza(poliza);
	        
	        $timeout(function(){
	        	$scope.poliza = poliza;
	        	$('.loadingSVG').hide();
	        	$('.container-fluid').removeClass('loadingFx');
	        	$scope.finish3 = true;
	        }, 100);
        };
        
    	var setGenericData = function(aseg){
        	$scope.polizaEmit.cdProvincia = aseg.cdProvincia;
        	var localidadExt = aseg.cdCiudad.split('|');
	        $scope.polizaEmit.cdCiudad = localidadExt[0];
	        $scope.polizaEmit.cdPostal = localidadExt[1] || $scope.asegurado.cdPostal;
			$scope.polizaEmit.deCiudad = aseg.deCiudad
			$scope.polizaEmit.deProvincia = aseg.deProvincia
			$scope.polizaEmit.domCalle = aseg.domCalle;
	        $scope.polizaEmit.domNro = aseg.domNro;
	        $scope.polizaEmit.domPiso = aseg.domPiso;
	        $scope.polizaEmit.domDepto = aseg.domDepto;
	        $scope.polizaEmit.nuTelefono = aseg.nuTelefono;
        	$scope.polizaEmit.diMail = aseg.diMail;

        	if($scope.asegurado.checkMail){
        		$scope.polizaEmit.polizaDigital = 'S';
        	}else{
        		$scope.polizaEmit.polizaDigital = 'N';
        	};

        	if($scope.persFisica == false){
        		$scope.polizaEmit.feIncripcionRegistral = aseg.feInscrRegJurid;
        		$scope.polizaEmit.nuIncripcionRegistral = aseg.numInscrRegJurid;
        		$scope.polizaEmit.feConstitucion = aseg.feConstJurid;
        	}else{
        		$scope.polizaEmit.cdPaisNacimiento = aseg.cdPaisNacimiento || '';
        		$scope.polizaEmit.cdPaisNacionalidad = aseg.cdPaisNacionalidad || '';
        	};
    	};

    	var setFormaPago = function(medioPago){
    		$scope.polizaEmit.origenFondosDDJJ = medioPago.origFondo;
    		if(medioPago.optionDDJJ == 's'){ $scope.polizaEmit.inPep = 'S'; $scope.polizaEmit.cargoPep = medioPago.motivo;
    		}else{ $scope.polizaEmit.inPep = 'N'; $scope.polizaEmit.cargoPep = '';};

    		$scope.polizaEmit.funcPubExt = medioPago.optionFuncPubExt;
    		$scope.polizaEmit.militaryProd = medioPago.optionMilitaryProd;
    		$scope.polizaEmit.mtIngresos = medioPago.ingresos;

    		switch(medioPago.optionFormaPago) {
	        	case '1': //cuenta santander
	        		for(var i in $scope.cuentas){
	        			if($scope.cuentas[i].ctaTarjetaRector == medioPago.cuentaSantander){
	        				$scope.polizaEmit.formaPago = $scope.cuentas[i];
	        				$scope.polizaEmit.formaPago.nuCBU = '';
	        				break; };
	        		};
	                break;
	        	case '2': //Tarjeta otro banco
	        		$scope.polizaEmit.formaPago.ctaTarjetaRector = medioPago.tarjOtroBancoNro;
	        		$scope.polizaEmit.formaPago.ctaTarjetaFormato = medioPago.tarjOtroBancoNro;
	        		$scope.polizaEmit.formaPago.tpCtaRector = medioPago.tarjOtroBanco;
	        		$scope.polizaEmit.formaPago.nroCtaContrato = "00000000";
	        		for(var i in $scope.tarjetasOtros){
	        			if($scope.tarjetasOtros[i].tipo == $scope.medioPago.tarjOtroBanco){
	        				$scope.polizaEmit.formaPago.deTpCtaRector = $scope.tarjetasOtros[i].descripcion;
	        				break; };
	        		};
	                break;  
	        	case '3': //Cuenta otro banco (CBU)
	        		$scope.polizaEmit.formaPago.nuCBU = medioPago.cuentaOtroBancoCbu;
	                break; 
	            default:
	                break;
	        };
    	};

    	var setBeneficiarios = function(benef){
    		
    		$scope.polizaEmit.beneficiarios = [];
    		
    		for(var i in benef){
    			if(benef[i].nmBeneficiario != '' && benef[i].nmBeneficiario != undefined){
    				$scope.polizaEmit.beneficiarios.push({nmBeneficiario: benef[i].nmBeneficiario, tpDoc: benef[i].tpDoc, nuDoc: benef[i].nuDoc, tpParentezco: benef[i].tpParentezco, nuParticipacion: benef[i].nuParticipacion});
    			};
    		};
    	};
    	
    	var resetPolizaEmit = function(){
    		$scope.polizaEmit.feVigenciaNormal = ''; $scope.polizaEmit.feVigenciaAutos = '';
    		$scope.polizaEmit.entreCallesViv = ''; $scope.polizaEmit.alarmaViv = '';
    		$scope.polizaEmit.tarjetasAseguradasRC = [];
    		$scope.polizaEmit.tarjetasAseguradasCP = [];
    		$scope.polizaEmit.tarjetasAseguradasPP = [];
    		$scope.polizaEmit.nuDJS = '';
    		$scope.polizaEmit.nuChasis = ''; $scope.polizaEmit.nuMotor = ''; $scope.polizaEmit.nuPatente = ''; $scope.polizaEmit.kilometraje = ''; $scope.polizaEmit.nuOblea = '';
    		$scope.polizaEmit.cdMarcaRegulador = ''; $scope.polizaEmit.tallerMontaje = ''; $scope.polizaEmit.nuSerie = ''; $scope.polizaEmit.feDesdeGNC = ''; $scope.polizaEmit.feHastaGNC = ''; $scope.polizaEmit.cilindros = [];
    	};

    	var wrapEmit = function(cdRamo){
        	var item = new ItemWraped(cdRamo);
        	resumeServ.addPoliza(item);
        };
        
        var ItemWraped = function(cdRamo) {
        	this.cdRamo = cdRamo;
        	this.asyncIsDone = false;
        	this.emitFails = false;
        	this.poliza = null;
    	};

        
        var sendRequest = function(){
    		
    		var formularioPolizaVO = formEmitServ.getPolizaOld();
    		var listPolizasSend = resumeServ.getPoliza();
    		var timeOutVal = 100;

    		listPolizasSend.forEach(function(element) {
    			timeOutVal = timeOutVal + 50;
    			$timeout(function() {
    				sendAsyncRequest(formularioPolizaVO, issueRepo.setEmitI, element.cdRamo);
    			}, timeOutVal);
    		});
	    		

    		$location.url('/issue/poliResume');
    	};
    	
    	var sendDigitalVerification = function(){
    		
    		var formularioPolizaVO = formEmitServ.getPolizaOld();
    		
    		
    		issueRepo.setDigitalVerification(formularioPolizaVO).
    		then(function(result){
    			
    			if(result.status == '200' || result.status == '201' )
    			{
    				
    				$scope.asegurado.hash=result.data.hash;
    				
		    		var polizaPropertiesList=['accPersonales', 'robo', 'desempleo', 'vida', 'vivienda', 'intConsorcio', 'protSalud', 'protCartera', 'compraProt', 'autos'  ];
		    		
		    		polizaPropertiesList.forEach(function(polizaType) {
			    		if($scope.poliza.hasOwnProperty(polizaType))
		    			{
		    				item = new ItemWraped($scope.poliza[polizaType].cdRamo);
		    				item.cdRamo=$scope.poliza[polizaType].cdRamo;
		    				item.asyncIsDone = true;
		    				var vigencia="";
		    				if(polizaType=="autos")
		    					vigencia=$scope.poliza.vigenciaAuto;
		    				else
		    					vigencia=$scope.poliza.vigencia;
		    					
		    				item.poliza= {
		    						"compania": $scope.poliza[polizaType].selCotizacion.deCompania,
				    				"deProducto": $scope.poliza[polizaType].selCotizacion.deRamo,
				    				"titular": $scope.asegurado.apeCli + ", " + $scope.asegurado.nmCli,
				    				"nuPoliza":"N",
				    				"nuCertificado":"A",
				    				"nuPolizaAuto":"N/A",
				    				"vigencia": vigencia,
				    				"estado": "PENDIENTE DE ACEPTACION DIGITAL"
				    					}
		    				
		    				resumeServ.updatePoliza(item);
		    			}
					})
	    			
					if( result.status == '201')
						alert(result.data.message);
					
		    		$location.url('/issue/poliResume');
    			}
		    	else
		    	{
		    		alert("Hubo un error al enviar la aceptacion digital.\n"+ result.data.message);
		    	}
    		});
    		
    		
    	};
    	
    	var sendAsyncRequest = function(formularioPolizaVO, dataService, cdRamo){
    		
    		formularioPolizaVO.cdRamo = cdRamo;
    		
    		var promis = dataService(formularioPolizaVO);

			promis.then(function(result){
				var item = resumeServ.getPolizaByRamo(result.cdRamo);
				
				if(!item){
					item = new ItemWraped(result.cdRamo);
				}
				if(result.tpDocumento == 'D'){ result.tpDocumento = 'DNI';
				
				}
				item.asyncIsDone = true;
				item.poliza = result;
				resumeServ.updatePoliza(item);
			});
    		
    	};

        var initValidations = function(){
        	
        	$scope.errorEmit = "";
        	
        	//Step 1
        	$scope.valDePaisNacimiento = true;
        	$scope.valDePaisNacionalidad = true;
        	$scope.valNuTelefonoStep1 = true;
        	$scope.valDomCalleStep1 = true;
        	$scope.valFeInscrRegJurid = true;
        	$scope.valFeConstJurid = true;
        	$scope.valNumInscrRegJurid = true;
        	$scope.valDiMail = true;
        	
        	//Step 2
        	$scope.valOrigFondo = true;
        	$scope.valMotivo = true;
        	$scope.valDDJJLegal = true;
        	$scope.valOptionFormaPago = true;
        	$scope.valIngresos = true;
        	
        	//Step 3
        	$scope.valVigencia = true;
        	$scope.valVigenciaAuto = true;
        	
        	$scope.valNuDJS = true;
        	
        	$scope.valTarjetasAsegRC = true;
        	$scope.valTarjetasAsegPP = true;
        	
        	$scope.valDomicilio = true;
        	
        	$scope.valTarjetasAsegCompra = true;
        	
        	$scope.valNuChasis = true;
        	$scope.valNuPatente = true;
        	$scope.valKm = true;
        	$scope.valInspec = true;
        	$scope.valNuMotor = true;
        	$scope.valNuObleaGnc = true;
        	$scope.valTallerMonGnc = true;
        	$scope.valMarcaRegGnc = true;
        	$scope.valNuSerieGnc = true;
        	$scope.valFeDesdeGnc = true;
        	$scope.valFeHastaGnc = true;
        	
        };
        
        
    	//$scope functions
    	$scope.filtFondos = function(el){return parseInt(el.valor) >= 0;};
        $scope.filtTarjetas = function(el){if(parseInt(el.valor) >= 0){return false;}else{return true;};};
        $scope.resetFormaPago = function(){ $scope.medioPago.cuentaSantander = ''; $scope.medioPago.tarjOtroBanco = ''; $scope.medioPago.tarjOtroBancoNro = ''; $scope.medioPago.cuentaOtroBancoCbu = '';};
        
        $scope.resetBenef = function(index){
    		$scope.poliza.beneficiarios[index] = {nmBeneficiario: '', tpDoc: '', nuDoc: '', tpParentezco: '', nuParticipacion: ''};
    	};
    	
    		    		
    	$scope.emit = function(){
    		if($scope.isVerificaDigital)
    			$('#sendAceptacion').button('loading');
    		else
    			$('#emitir').button('loading');
    		
    		$('.loadingSVG').show();
    		$('.container-fluid').addClass('loadingFx');
        	$scope.errorEmit = '';
        	resetPolizaEmit();
        	resumeServ.reset();
        	
        	setGenericData($scope.asegurado);
        	setFormaPago($scope.medioPago);
        	
        	//accPersonales
        	if($scope.poliza.hasOwnProperty('accPersonales')){
        		$scope.polizaEmit.feVigenciaNormal = $scope.poliza.vigencia;
        		setBeneficiarios($scope.poliza.beneficiarios);
        		wrapEmit($scope.poliza.accPersonales.cdRamo);
        	};
        	//Robo en cajeros
        	if($scope.poliza.hasOwnProperty('robo')){
        		$scope.polizaEmit.feVigenciaNormal = $scope.poliza.vigencia;
        		setBeneficiarios($scope.poliza.beneficiarios);
        		for(var i=0; i < $scope.tarjetasAsegRC.length; i++){
        		 	if($scope.tarjetasAsegRC[i].check){
        		 		$scope.polizaEmit.tarjetasAseguradasRC.push($scope.tarjetasAsegRC[i]);
        		 	};
        		};
        		wrapEmit($scope.poliza.robo.cdRamo);
        		
        	};
        	//Desempleo
        	if($scope.poliza.hasOwnProperty('desempleo')){
        		$scope.polizaEmit.feVigenciaNormal = $scope.poliza.vigencia;
        		setBeneficiarios($scope.poliza.beneficiarios);
        		//tarjetas PP
        		if ($scope.selectedTarjetaPP){
                    $scope.polizaEmit.tarjetasAseguradasPP.push($scope.selectedTarjetaPP);
                }
        		
        		wrapEmit($scope.poliza.desempleo.cdRamo);
        		
        	};    	
        	//Vida
        	if($scope.poliza.hasOwnProperty('vida')){
        		$scope.polizaEmit.feVigenciaNormal = $scope.poliza.vigencia;
        		$scope.polizaEmit.nuDJS = $scope.poliza.vida.nuDJS;
        		setBeneficiarios($scope.poliza.beneficiarios);
        		wrapEmit($scope.poliza.vida.cdRamo);
        	};
        	//Vivienda
        	if($scope.poliza.hasOwnProperty('vivienda')){
				$scope.polizaEmit.domCdProvincia= $scope.poliza.vivienda.cdProvincia;
				$scope.polizaEmit.domDeProvincia= $scope.poliza.vivienda.deProvincia;
				$scope.polizaEmit.domCdCiudad= $scope.poliza.vivienda.cdLocalidad;
				$scope.polizaEmit.domDeCiudad= $scope.poliza.vivienda.deLocalidad;
        		$scope.polizaEmit.domCdPostal= $scope.poliza.vivienda.cdPostal;
        		$scope.polizaEmit.feVigenciaNormal = $scope.poliza.vigencia;
        		$scope.polizaEmit.domCalleViv = $scope.poliza.vivienda.domCalle.toLocaleUpperCase() || '';
        		$scope.polizaEmit.domNroViv = $scope.poliza.vivienda.domNro || '';
        		$scope.polizaEmit.domPisoViv = $scope.poliza.vivienda.domPiso || '';
            	$scope.polizaEmit.domDeptoViv = $scope.poliza.vivienda.domDepto.toLocaleUpperCase() || '';
            	$scope.polizaEmit.entreCallesViv = $scope.poliza.vivienda.entreCalles.toLocaleUpperCase() || '';
        		$scope.polizaEmit.alarmaViv = $scope.poliza.vivienda.alarma.toLocaleUpperCase() || '';
        		$scope.polizaEmit.cdRamo = $scope.poliza.vivienda.cdRamo;
        		wrapEmit($scope.poliza.vivienda.cdRamo);
        	};
        	//Integral de consorcio
        	if($scope.poliza.hasOwnProperty('intConsorcio')){
        		$scope.polizaEmit.feVigenciaNormal = $scope.poliza.vigencia;
        	};	
        	//Proteccion salud
        	if($scope.poliza.hasOwnProperty('protSalud')){
        		$scope.polizaEmit.feVigenciaNormal = $scope.poliza.vigencia;
        		wrapEmit($scope.poliza.protSalud.cdRamo);
        	};
        	//Proteccion cartera
        	if($scope.poliza.hasOwnProperty('protCartera')){
        		$scope.polizaEmit.feVigenciaNormal = $scope.poliza.vigencia;
        		wrapEmit($scope.poliza.protCartera.cdRamo);
        	};	
        	//Compra protegida
        	if($scope.poliza.hasOwnProperty('compraProt')){
        		$scope.polizaEmit.feVigenciaNormal = $scope.poliza.vigencia;
        		for(var i=0; i < $scope.tarjetasAsegCP.length; i++){
        			if($scope.tarjetasAsegCP[i].check){
        				$scope.polizaEmit.tarjetasAseguradasCP.push($scope.tarjetasAsegCP[i]);
        			};
        		};
        		wrapEmit($scope.poliza.compraProt.cdRamo);
        	};
        	//Autos
        	if($scope.poliza.hasOwnProperty('autos')){
        		$scope.polizaEmit.feVigenciaAutos = $scope.poliza.vigenciaAuto;
        		
        		var poliza = $scope.poliza.autos;
        		$scope.polizaEmit.domCalleAuto = poliza.domCalle || '';
        		$scope.polizaEmit.domNroAuto = poliza.domNro || '';
        		$scope.polizaEmit.domPisoAuto = poliza.domPiso || '';
            	$scope.polizaEmit.domDeptoAuto = poliza.domDepto || '';
        		$scope.polizaEmit.nuChasis = poliza.nuChasis;
        		$scope.polizaEmit.nuMotor = poliza.nuMotor;
        		$scope.polizaEmit.nuPatente = poliza.nuPatente;
        		$scope.polizaEmit.telInspec = poliza.telInspec;
        		$scope.polizaEmit.kilometraje = poliza.km;
        		$scope.polizaEmit.descModeloAuto = $scope.descModelo;
        		$scope.polizaEmit.descMarcaAuto = $scope.descMarca;

        		
        		if(poliza.tpGnc != 'N'){
	        		$scope.polizaEmit.nuOblea = poliza.nuObleaGnc;
	        		$scope.polizaEmit.cdMarcaRegulador = poliza.marcaRegGnc;
	        		$scope.polizaEmit.tallerMontaje = poliza.tallerMonGnc;
	        		$scope.polizaEmit.nuSerie = poliza.nuSerieGnc;
	        		$scope.polizaEmit.feDesdeGNC = moment(poliza.feDesdeGnc).format("YYYYMMDD");
	        		$scope.polizaEmit.feHastaGNC = moment(poliza.feHastaGnc).format("YYYYMMDD");
	        		
	        		for(var i=0; i < poliza.cilindros.length; i++){
	        			if(poliza.cilindros[i].cdMarcaCilindro != '' && poliza.cilindros[i].cdMarcaCilindro != undefined){
	        				$scope.polizaEmit.cilindros.push({cdMarcaCilindro: poliza.cilindros[i].cdMarcaCilindro , nuSerieCilindro: poliza.cilindros[i].nuSerieCilindro, feVigenciaCilindro: moment(poliza.cilindros[i].feVigenciaCilindro).format("YYYYMMDD")});
	        			};
	        		};
        		};
        		wrapEmit($scope.poliza.autos.cdRamo);
        		
        	};
        	
        	var ver = "new";
        	if(ver == 'new'){
        		if($scope.isVerificaDigital)
        			sendDigitalVerification();
        		else
        			sendRequest();
        	} else {
        		$timeout(function() {
		        	formEmitServ.setPolizaOld($scope.polizaEmit);
		        	formEmitServ.setMedioPagoOld($scope.medioPago);
		        	formEmitServ.setBenefOld($scope.poliza.beneficiarios);
		        	var promis = issueRepo.setEmit($scope.polizaEmit);
		    		promis.then(function(result){
		    			if(result.status == '200'){
		        			formEmitServ.setPoliza(result.data);
		    	            $location.url('/issue/poliResume');
		    			} else {
		    				issueRepo.getPolizas(function(data){
		    					formEmitServ.setPoliza(data);
		    					$location.url('/issue/poliResume');
		    				});
		    			};
		    			$('#emitir').button('reset');
		    		}, function(){ 
		    			$scope.errorEmit = 'Se produjo un error al emitir.';
		    			$('#emitir').button('reset');
		    		});
	        	}, 2000);
        	}
        };

        $scope.fraseCierreMedioPago = function(){
        	var textoPago = "";
        	
			switch($scope.medioPago.optionFormaPago) {
				case '1': //cuenta santander
	        		for(var i in $scope.cuentas){
	        			if($scope.cuentas[i].ctaTarjetaRector == $scope.medioPago.cuentaSantander){
	        				textoPago = "de la " + $scope.cuentas[i].deTpCtaRector + " Nro. " + $scope.cuentas[i].ctaTarjetaFormato;
	        				break; };
	        		};
	                break;
				case '2': //Tarjeta otro banco
	        		for(var i in $scope.tarjetasOtros){
	        			if($scope.tarjetasOtros[i].tipo == $scope.medioPago.tarjOtroBanco){
	        				textoPago = "de la " + $scope.tarjetasOtros[i].descripcion + " Nro. " + $scope.medioPago.tarjOtroBancoNro;
	        				break; };
	        		};
					break;  
				case '3': //Cuenta otro banco (CBU)
					textoPago = "del CBU Nro. " + $scope.medioPago.cuentaOtroBancoCbu;
					break; 
				default:
					break;
			};
			
			return textoPago;
        };

        $scope.fraseCierreVentaPorRamo = function(){
    		var fraseCierre = "";
        	var valFrases = true;

			if($scope.poliza.hasOwnProperty('accPersonales') && valFrases){
				
				if($scope.isVerificaDigital)
					fraseCierre = "Sera enviado un mail a "+ $scope.clientMail +" para la aceptacion digital del seguro de Accidentes Personales de la compañía Zurich Santander para ";
				else
					fraseCierre = "A partir de este momento damos de alta el seguro de Accidentes Personales de la compañía Zurich Santander para ";
				
	    		if ($scope.asegurado.inSexo == "M") {
	    			fraseCierre = fraseCierre + "el Sr. ";
	    		} else {
	    			fraseCierre = fraseCierre + "la Sra. ";
	    		}
				
	    		fraseCierre = fraseCierre + $scope.asegurado.nmCli + " " + $scope.asegurado.apeCli; 
				fraseCierre = fraseCierre + " con una suma asegurada de hasta $ " + parseFloat($scope.poliza.accPersonales.selCotizacion.sumaAsegurada);
				fraseCierre = fraseCierre + " en caso de Muerte Accidental,";
				fraseCierre = fraseCierre + " con una cuota de $ " + parseFloat($scope.poliza.accPersonales.selCotizacion.mtCuota).toFixed(2);
				fraseCierre = fraseCierre + " a debitarse " + $scope.fraseCierreMedioPago() + ". ";
				
				if(!$scope.isVerificaDigital)
				{
					fraseCierre = fraseCierre + "La cobertura entra en vigencia a partir del " + $scope.poliza.vigencia + ". ";
					fraseCierre = fraseCierre + "Habiendo aceptado el seguro, te estaré facilitando el número de tu póliza.";
					fraseCierre = fraseCierre + "\n\nPodés consultar las condiciones, características, exclusiones y límites de las pólizas ingresando en www.santander.com.ar.";
					fraseCierre = fraseCierre + "\n\nTe informo, además, que contás con los canales de Online Banking y WEB del banco para ingresar la Solicitud de Baja de tu seguro.";
					fraseCierre = fraseCierre + "\n\nPor último, recordá que podés agregar beneficiarios a tu póliza a través de Superlinea.";
				}
				
				fraseCierre = fraseCierre + "\n\n¿Confirmás la operación?";

	    		if(confirm(fraseCierre)){
	    			valFrases = true;
	    		} else {
	    			valFrases = false;
	    		}
			}

			if($scope.poliza.hasOwnProperty('vida') && valFrases){
				
				
				if($scope.isVerificaDigital)
					fraseCierre = "Sera enviado un mail a "+ $scope.clientMail +" para la aceptacion digital del seguro de Vida de la compañía Zurich Santander para ";
				else
					fraseCierre = "A partir de este momento damos de alta el seguro de Vida de la compañía Zurich Santander para ";
					
	    		if ($scope.asegurado.inSexo == "M") {
	    			fraseCierre = fraseCierre + "el Sr. ";
	    		} else {
	    			fraseCierre = fraseCierre + "la Sra. ";
	    		}
				fraseCierre = fraseCierre + $scope.asegurado.nmCli + " " + $scope.asegurado.apeCli; 
				fraseCierre = fraseCierre + " con una suma asegurada de hasta $ " + parseFloat($scope.poliza.vida.selCotizacion.sumaAsegurada);
				fraseCierre = fraseCierre + " en caso de Muerte,";
				fraseCierre = fraseCierre + " con una cuota de $ " + parseFloat($scope.poliza.vida.selCotizacion.mtCuota).toFixed(2);
				fraseCierre = fraseCierre + " a debitarse " + $scope.fraseCierreMedioPago() + ". ";
				
				if(!$scope.isVerificaDigital)
				{
					fraseCierre = fraseCierre + "La cobertura entra en vigencia a partir del " + $scope.poliza.vigencia + ". ";
					fraseCierre = fraseCierre + "Habiendo aceptado el seguro, te estaré facilitando el número de tu póliza.";
					fraseCierre = fraseCierre + "\n\nPodés consultar las condiciones, características, exclusiones y límites de las pólizas ingresando en www.santander.com.ar.";
					fraseCierre = fraseCierre + "\n\nTe informo, además, que contás con los canales de Online Banking y WEB del banco para ingresar la Solicitud de Baja de tu seguro.";
					fraseCierre = fraseCierre + "\n\nPor último, recordá que podés agregar beneficiarios a tu póliza a través de Superlinea.";
				}
				
				fraseCierre = fraseCierre + "\n\n¿Confirmás la operación?";

	    		if(confirm(fraseCierre)){
	    			valFrases = true;
	    		} else {
	    			valFrases = false;
	    		}
			}

			if($scope.poliza.hasOwnProperty('robo') && valFrases){
				
				if($scope.isVerificaDigital)
					fraseCierre = "Sera enviado un mail a "+ $scope.clientMail +" para la aceptacion digital del seguro de Robo en Cajeros de la compañía Zurich Santander para ";
				else
					fraseCierre = "A partir de este momento damos de alta el seguro de Robo en Cajeros de la compañía Zurich Santander para ";
	    		if ($scope.asegurado.inSexo == "M") {
	    			fraseCierre = fraseCierre + "el Sr. ";
	    		} else {
	    			fraseCierre = fraseCierre + "la Sra. ";
	    		}
				fraseCierre = fraseCierre + $scope.asegurado.nmCli + " " + $scope.asegurado.apeCli; 
				fraseCierre = fraseCierre + " con una suma asegurada de hasta $ " + parseFloat($scope.poliza.robo.selCotizacion.sumaAsegurada);
				fraseCierre = fraseCierre + " en caso de robo del dinero extraído de un cajero automático, hasta dos eventos,";
				fraseCierre = fraseCierre + " con una cuota de $ " + parseFloat($scope.poliza.robo.selCotizacion.mtCuota).toFixed(2);
				fraseCierre = fraseCierre + " a debitarse " + $scope.fraseCierreMedioPago() + ". ";
				if(!$scope.isVerificaDigital)
				{
					fraseCierre = fraseCierre + "La cobertura entra en vigencia a partir del " + $scope.poliza.vigencia + ". ";
					fraseCierre = fraseCierre + "Habiendo aceptado el seguro, te estaré facilitando el número de tu póliza.";
					fraseCierre = fraseCierre + "\n\nPodés consultar las condiciones, características, exclusiones y límites de las pólizas ingresando en www.santander.com.ar.";
					fraseCierre = fraseCierre + "\n\nTe informo, además, que contás con los canales de Online Banking y WEB del banco para ingresar la Solicitud de Baja de tu seguro.";
					fraseCierre = fraseCierre + "\n\nPor último, recordá que podés agregar beneficiarios a tu póliza a través de Superlinea.";
				}
				fraseCierre = fraseCierre + "\n\n¿Confirmás la operación?";

	    		if(confirm(fraseCierre)){
	    			valFrases = true;
	    		} else {
	    			valFrases = false;
	    		}
			}

			if($scope.poliza.hasOwnProperty('desempleo') && valFrases){
				
				if($scope.isVerificaDigital)
					fraseCierre = "Sera enviado un mail a "+ $scope.clientMail +" para la aceptacion digital del seguro de ";
				else
					fraseCierre = "A partir de este momento damos de alta el seguro de ";
				
				if ($scope.poliza.desempleo.isPP) {
        			fraseCierre = fraseCierre + "Protección de Pagos ";
        		} else {
        			fraseCierre = fraseCierre + "Gastos Protegidos ";
        		}
				fraseCierre = fraseCierre + "de la compañía Zurich Santander para ";
				if ($scope.asegurado.inSexo == "M") {
	    			fraseCierre = fraseCierre + "el Sr. ";
	    		} else {
	    			fraseCierre = fraseCierre + "la Sra. ";
	    		}
				fraseCierre = fraseCierre + $scope.asegurado.nmCli + " " + $scope.asegurado.apeCli; 
				if ($scope.poliza.desempleo.selCotizacion.cdClasifPlan == "AUT") {
					fraseCierre = fraseCierre + " con una cobertura ante incapacidad";
				} else {
					fraseCierre = fraseCierre + " con una cobertura ante desempleo";
				}
				if ($scope.poliza.desempleo.isPP) {
        			fraseCierre = fraseCierre + " con un costo mensual de " + $scope.poliza.desempleo.selCotizacion.costoDsmPP + " ";
    				fraseCierre = fraseCierre + $scope.selectedTarjetaPP.deTpCtaRector + " " + $scope.selectedTarjetaPP.ctaTarjetaRector;
    				fraseCierre = fraseCierre + " y sus adicionales a debitarse de la misma. ";
        		} else {
    				fraseCierre = fraseCierre + " con un costo mensual de $ " + parseFloat($scope.poliza.desempleo.selCotizacion.mtCuota).toFixed(2);
    				fraseCierre = fraseCierre + " a debitarse " + $scope.fraseCierreMedioPago() + ". ";
        		}
				
				if(!$scope.isVerificaDigital)
				{
					fraseCierre = fraseCierre + "La cobertura entra en vigencia a partir del " + $scope.poliza.vigencia + ". ";
					fraseCierre = fraseCierre + "Recordá que comenzarás a gozar de la misma transcurridos los 30 días corridos desde el inicio de vigencia de tu seguro. En caso de siniestro el pago se realizará si tu condición de ";
					if ($scope.poliza.desempleo.selCotizacion.cdClasifPlan == "AUT") {
						fraseCierre = fraseCierre + "incapacidad se mantiene por más de 30 días ";
					} else {
						fraseCierre = fraseCierre + "desempleo se mantiene por más de 30 días ";
					}
					if ($scope.poliza.desempleo.isPP) {
						fraseCierre = fraseCierre + "con un tope de hasta $ " + parseFloat($scope.poliza.desempleo.selCotizacion.sumaAsegurada) + ". ";
					} else {
						fraseCierre = fraseCierre + "por un plazo máximo de 6 meses, hasta la suma máxima asegurada que te acaba de ser informada. ";
					}
					fraseCierre = fraseCierre + "Habiendo aceptado el seguro, te estaré facilitando el número de tu póliza.";
					fraseCierre = fraseCierre + "\n\nPodés consultar las condiciones, características, exclusiones y límites de las pólizas ingresando en www.santander.com.ar.";
					fraseCierre = fraseCierre + "\n\nTe informo, además, que contás con los canales de Online Banking y WEB del banco para ingresar la Solicitud de Baja de tu seguro.";
					fraseCierre = fraseCierre + "\n\nPor último, recordá que podés agregar beneficiarios a tu póliza a través de Superlinea.";
				}
				fraseCierre = fraseCierre + "\n\n¿Confirmás la operación?";

				if(confirm(fraseCierre)){
	    			valFrases = true;
	    		} else {
	    			valFrases = false;
	    		}
			}

			if($scope.poliza.hasOwnProperty('vivienda') && valFrases){
				
				if($scope.isVerificaDigital)
					fraseCierre = "Sera enviado un mail a "+ $scope.clientMail +" para la aceptacion digital del seguro de Vivienda ";
				else
					fraseCierre = "A partir de este momento damos de alta el seguro de Vivienda ";
				
				if ($scope.poliza.vivienda.selCotizacion.cdClasifPlan == "HIP") {
					fraseCierre = fraseCierre + "Complemento Hipotecario ";
				}
				fraseCierre = fraseCierre + "de la compañía Zurich Santander para ";
				if ($scope.asegurado.inSexo == "M") {
	    			fraseCierre = fraseCierre + "el Sr. ";
	    		} else {
	    			fraseCierre = fraseCierre + "la Sra. ";
	    		}
				fraseCierre = fraseCierre + $scope.asegurado.nmCli + " " + $scope.asegurado.apeCli; 
				if ($scope.poliza.vivienda.selCotizacion.cdClasifPlan == "HIP") {
					fraseCierre = fraseCierre + ", para la vivienda ubicada en la calle " + $scope.poliza.vivienda.domCalle + ", N° " + $scope.poliza.vivienda.domNro + ",";
				} else {
					fraseCierre = fraseCierre + " con una suma asegurada de hasta $ " + parseFloat($scope.poliza.vivienda.selCotizacion.sumaAsegurada);
					fraseCierre = fraseCierre + " de Incendio de Edificio, para la vivienda ubicada en la calle " + $scope.poliza.vivienda.domCalle + ", N° " + $scope.poliza.vivienda.domNro + ",";
				}
				fraseCierre = fraseCierre + " con una cuota de $ " + parseFloat($scope.poliza.vivienda.selCotizacion.mtCuota).toFixed(2);
				fraseCierre = fraseCierre + " a debitarse " + $scope.fraseCierreMedioPago() + ". ";
				
				if(!$scope.isVerificaDigital)
				{
					fraseCierre = fraseCierre + "La cobertura entra en vigencia a partir del " + $scope.poliza.vigencia + ". ";
					fraseCierre = fraseCierre + "Habiendo aceptado el seguro, te estaré facilitando el número de tu póliza.";
					fraseCierre = fraseCierre + "\n\nPodés consultar las condiciones, características, exclusiones y límites de las pólizas ingresando en www.santander.com.ar.";
					fraseCierre = fraseCierre + "\n\nTe informo, además, que contás con los canales de Online Banking y WEB del banco para ingresar la Solicitud de Baja de tu seguro.";
				}
				fraseCierre = fraseCierre + "\n\n¿Confirmás la operación?";

	    		if(confirm(fraseCierre)){
	    			valFrases = true;
	    		} else {
	    			valFrases = false;
	    		}
			}
			
			if($scope.poliza.hasOwnProperty('protSalud') && valFrases){
				
				if($scope.isVerificaDigital)
					fraseCierre = "Sera enviado un mail a "+ $scope.clientMail +" para la aceptacion digital del seguro de Protección ";
				else
					fraseCierre = "A partir de este momento damos de alta el seguro de Protección ";
				
	    		if ($scope.asegurado.inSexo == "M") {
	    			fraseCierre = fraseCierre + "Masculina";
	    		} else {
	    			fraseCierre = fraseCierre + "Femenina";
	    		}
				fraseCierre = fraseCierre + " de la compañía Zurich Santander para ";
	    		if ($scope.asegurado.inSexo == "M") {
	    			fraseCierre = fraseCierre + "el Sr. ";
	    		} else {
	    			fraseCierre = fraseCierre + "la Sra. ";
	    		}
				fraseCierre = fraseCierre + $scope.asegurado.nmCli + " " + $scope.asegurado.apeCli; 
				fraseCierre = fraseCierre + " con una suma asegurada de hasta $ " + parseFloat($scope.poliza.protSalud.selCotizacion.sumaAsegurada);
	    		if ($scope.asegurado.inSexo == "M") {
					fraseCierre = fraseCierre + " en caso de Diagnostico positivo de cáncer de pulmón, colon, próstata y cualquier otro tipo de cáncer,";
	    		} else {
					fraseCierre = fraseCierre + " en caso de Diagnostico positivo de cáncer de ovario, mama, útero,";
	    		}
				fraseCierre = fraseCierre + " con una cuota de $ " + parseFloat($scope.poliza.protSalud.selCotizacion.mtCuota).toFixed(2);
				fraseCierre = fraseCierre + " a debitarse " + $scope.fraseCierreMedioPago() + ". ";
				
				if(!$scope.isVerificaDigital)
				{
		            fraseCierre = fraseCierre + "Para que tengan cobertura los tipos de cáncer mencionados deben tener invasión del tejido y/o dispersión ";
		            fraseCierre = fraseCierre + "de la afección (metástasis), incluyendo leucemia (excepto leucemia linfática crónica). Se excluyen los ";
		            fraseCierre = fraseCierre + "canceres \"in situ\" o sea NO invasivos y cualquier cancer de piel con excepción del melanoma maligno. ";
					fraseCierre = fraseCierre + "La cobertura entra en vigencia a partir del " + $scope.poliza.vigencia + ". ";
					fraseCierre = fraseCierre + "Habiendo aceptado el seguro, te estaré facilitando el número de tu póliza.";
					fraseCierre = fraseCierre + "\n\nPodés consultar las condiciones, características, exclusiones y límites de las pólizas ingresando en www.santander.com.ar.";
					fraseCierre = fraseCierre + "\n\nTe informo, además, que contás con los canales de Online Banking y WEB del banco para ingresar la Solicitud de Baja de tu seguro.";
					fraseCierre = fraseCierre + "\n\nPor último, recordá que podés agregar beneficiarios a tu póliza a través de Superlinea.";
				}
				
				fraseCierre = fraseCierre + "\n\n¿Confirmás la operación?";

	    		if(confirm(fraseCierre)){
	    			valFrases = true;
	    		} else {
	    			valFrases = false;
	    		}
			}

			if($scope.poliza.hasOwnProperty('protCartera') && valFrases){
				
				if($scope.isVerificaDigital)
					fraseCierre = "Sera enviado un mail a "+ $scope.clientMail +" para la aceptacion digital del seguro de Protección Cartera de la compañía Zurich Santander para ";
				else
					fraseCierre = "A partir de este momento damos de alta el seguro de Protección Cartera de la compañía Zurich Santander para ";
	    		
				if ($scope.asegurado.inSexo == "M") {
	    			fraseCierre = fraseCierre + "el Sr. ";
	    		} else {
	    			fraseCierre = fraseCierre + "la Sra. ";
	    		}
				fraseCierre = fraseCierre + $scope.asegurado.nmCli + " " + $scope.asegurado.apeCli; 
				fraseCierre = fraseCierre + " con una suma asegurada de hasta $ " + parseFloat($scope.poliza.protCartera.selCotizacion.sumaAsegurada);
				fraseCierre = fraseCierre + " en caso de robo,";
				fraseCierre = fraseCierre + " con una cuota de $ " + parseFloat($scope.poliza.protCartera.selCotizacion.mtCuota).toFixed(2);
				fraseCierre = fraseCierre + " a debitarse " + $scope.fraseCierreMedioPago() + ". ";
				if(!$scope.isVerificaDigital)
				{
					fraseCierre = fraseCierre + "La cobertura entra en vigencia a partir del " + $scope.poliza.vigencia + ". ";
					fraseCierre = fraseCierre + "Habiendo aceptado el seguro, te estaré facilitando el número de tu póliza.";
					fraseCierre = fraseCierre + "\n\nPodés consultar las condiciones, características, exclusiones y límites de las pólizas ingresando en www.santander.com.ar.";
					fraseCierre = fraseCierre + "\n\nTe informo, además, que contás con los canales de Online Banking y WEB del banco para ingresar la Solicitud de Baja de tu seguro.";
				}
				fraseCierre = fraseCierre + "\n\n¿Confirmás la operación?";

	    		if(confirm(fraseCierre)){
	    			valFrases = true;
	    		} else {
	    			valFrases = false;
	    		}
			}

			if($scope.poliza.hasOwnProperty('compraProt') && valFrases){
				if($scope.isVerificaDigital)
					fraseCierre = "Sera enviado un mail a "+ $scope.clientMail +" para la aceptacion digital del seguro de Compra Protegida de la compañía Zurich Santander para ";
				else
					fraseCierre = "A partir de este momento damos de alta el seguro de Compra Protegida de la compañía Zurich Santander para ";
				
	    		if ($scope.asegurado.inSexo == "M") {
	    			fraseCierre = fraseCierre + "el Sr. ";
	    		} else {
	    			fraseCierre = fraseCierre + "la Sra. ";
	    		}
				fraseCierre = fraseCierre + $scope.asegurado.nmCli + " " + $scope.asegurado.apeCli; 
				fraseCierre = fraseCierre + " con una suma asegurada de hasta $ " + parseFloat($scope.poliza.compraProt.selCotizacion.sumaAsegurada);
				fraseCierre = fraseCierre + " en caso de robo y daños materiales,";
				fraseCierre = fraseCierre + " con una cuota de $ " + parseFloat($scope.poliza.compraProt.selCotizacion.mtCuota).toFixed(2);
				fraseCierre = fraseCierre + " a debitarse " + $scope.fraseCierreMedioPago() + ". ";
				if(!$scope.isVerificaDigital)
				{
					fraseCierre = fraseCierre + "La cobertura entra en vigencia a partir del " + $scope.poliza.vigencia + ". ";
					fraseCierre = fraseCierre + "Habiendo aceptado el seguro, te estaré facilitando el número de tu póliza.";
					fraseCierre = fraseCierre + "\n\nPodés consultar las condiciones, características, exclusiones y límites de las pólizas ingresando en www.santander.com.ar.";
					fraseCierre = fraseCierre + "\n\nTe informo, además, que contás con los canales de Online Banking y WEB del banco para ingresar la Solicitud de Baja de tu seguro.";
				}
				fraseCierre = fraseCierre + "\n\n¿Confirmás la operación?";

	    		if(confirm(fraseCierre)){
	    			valFrases = true;
	    		} else {
	    			valFrases = false;
	    		}
			}

			if($scope.poliza.hasOwnProperty('autos') && valFrases){
				
				if($scope.isVerificaDigital)
					fraseCierre = "Sera enviado un mail a "+ $scope.clientMail +" para la aceptacion digital del seguro de Auto de la compañía " + $scope.poliza.autos.selCotizacion.deCompania + " para ";
				else
					fraseCierre = "A partir de este momento damos de alta el seguro de Auto de la compañía " + $scope.poliza.autos.selCotizacion.deCompania + " para ";
	    		
				if ($scope.asegurado.inSexo == "M") {
	    			fraseCierre = fraseCierre + "el Sr. ";
	    		} else {
	    			fraseCierre = fraseCierre + "la Sra. ";
	    		}
				fraseCierre = fraseCierre + $scope.asegurado.nmCli + " " + $scope.asegurado.apeCli; 
		        fraseCierre = fraseCierre + " con una cobertura de " + $scope.poliza.autos.selCotizacion.dePlan + ", ";
				fraseCierre = fraseCierre + " con una cuota de $ " + parseFloat($scope.poliza.autos.selCotizacion.mtCuota).toFixed(2);
				fraseCierre = fraseCierre + " a debitarse " + $scope.fraseCierreMedioPago() + ". ";
				if(!$scope.isVerificaDigital)
				{
					fraseCierre = fraseCierre + "La cobertura comenzará a regir a partir ";
					if ($scope.poliza.autos.selCotizacion.cdRamo == 36) {
						fraseCierre = fraseCierre + "de las 12 hs ";
					} 
					fraseCierre = fraseCierre + "del " + $scope.poliza.vigenciaAuto + ". ";
					fraseCierre = fraseCierre + "Habiendo aceptado el seguro, te estaré facilitando el número de tu póliza.";
					fraseCierre = fraseCierre + "\n\nPodés consultar las condiciones, características, exclusiones y límites de las pólizas ingresando en www.santander.com.ar.";
					fraseCierre = fraseCierre + "\n\nTe informo, además, que contás con los canales de Online Banking y WEB del banco para ingresar la Solicitud de Baja de tu seguro.";
				}
				fraseCierre = fraseCierre + "\n\n¿Confirmás la operación?";

	    		if(confirm(fraseCierre)){
	    			valFrases = true;
	    		} else {
	    			valFrases = false;
	    		}
			}

    		if(valFrases){
    				$scope.emit();
    		} else {
    			$scope.backStep();
    		}
        };

        
        $scope.fraseCierreVentaGeneral = function(){
        	var mtCuotaTotal = 0;
    		var fraseCierre = "";
    		if ($scope.asegurado.inSexo == "M") {
    			fraseCierre = "Sr. ";
    		} else {
    			fraseCierre = "Sra. ";
    		}
    		
			fraseCierre = fraseCierre + $scope.asegurado.nmCli + " " + $scope.asegurado.apeCli + "\n\n"; 
			
			if($scope.isVerificaDigital)
				fraseCierre = fraseCierre + "Sera enviado un mail a "+ $scope.clientMail +" para la aceptacion digital de los seguros de";
			else
				fraseCierre = fraseCierre + "A partir del dia " + $scope.poliza.vigencia + " se encontraran vigentes las coberturas de los seguros de";

			if($scope.poliza.hasOwnProperty('accPersonales')){
				fraseCierre = fraseCierre + " Accidentes Personales,";
				mtCuotaTotal = mtCuotaTotal + parseFloat($scope.poliza.accPersonales.selCotizacion.mtCuota);
			}
			if($scope.poliza.hasOwnProperty('vida')){
				fraseCierre = fraseCierre + " Vida,";
				mtCuotaTotal = mtCuotaTotal + parseFloat($scope.poliza.vida.selCotizacion.mtCuota);
			}
			if($scope.poliza.hasOwnProperty('robo')){
				fraseCierre = fraseCierre + " Robo en Cajeros,";
				mtCuotaTotal = mtCuotaTotal + parseFloat($scope.poliza.robo.selCotizacion.mtCuota);
			}
			if($scope.poliza.hasOwnProperty('desempleo')){
        		if ($scope.poliza.desempleo.isPP) {
        			fraseCierre = fraseCierre + " Protección de Pagos,";
        		} else {
        			fraseCierre = fraseCierre + " Gastos Protegidos,";
        		}
			}
			if($scope.poliza.hasOwnProperty('vivienda')){
				fraseCierre = fraseCierre + " Vivienda,";
				mtCuotaTotal = mtCuotaTotal + parseFloat($scope.poliza.vivienda.selCotizacion.mtCuota);
			}
			if($scope.poliza.hasOwnProperty('protSalud')){
				fraseCierre = fraseCierre + " Protección Salud,";
				mtCuotaTotal = mtCuotaTotal + parseFloat($scope.poliza.protSalud.selCotizacion.mtCuota);
			}
			if($scope.poliza.hasOwnProperty('protCartera')){
				fraseCierre = fraseCierre + " Protección Cartera,";
				mtCuotaTotal = mtCuotaTotal + parseFloat($scope.poliza.protCartera.selCotizacion.mtCuota);
			}
			if($scope.poliza.hasOwnProperty('compraProt')){
				fraseCierre = fraseCierre + " Compra Protegida,";
				mtCuotaTotal = mtCuotaTotal + parseFloat($scope.poliza.compraProt.selCotizacion.mtCuota);
			}
			if($scope.poliza.hasOwnProperty('autos')){
				if(!$scope.isVerificaDigital)
					if ($scope.poliza.vigenciaAuto != $scope.poliza.vigencia) {
						fraseCierre = fraseCierre + " y a partir del dia " + $scope.poliza.vigenciaAuto + " se encontrara vigente la cobertura del seguro de";
					}
				
				fraseCierre = fraseCierre + " Auto,";
				mtCuotaTotal = mtCuotaTotal + parseFloat($scope.poliza.autos.selCotizacion.mtCuota);
			}
			
			if(!$scope.isVerificaDigital)
			{
	        	if($scope.poliza.hasOwnProperty('desempleo')){
	        		if ($scope.poliza.desempleo.isPP) {
	        			fraseCierre = fraseCierre + " con un costo mensual para la cobertura de Protección de Pagos de " + $scope.poliza.desempleo.selCotizacion.costoDsmPP;
	    				fraseCierre = fraseCierre + " a debitarse de la tarjeta " + $scope.selectedTarjetaPP.deTpCtaRector + " " + $scope.selectedTarjetaPP.ctaTarjetaRector;
	        			if (mtCuotaTotal > 0) {
	        				fraseCierre = fraseCierre + " y para el resto de las coberturas ";
	        			}
	        		} else {
	    				mtCuotaTotal = mtCuotaTotal + parseFloat($scope.poliza.desempleo.selCotizacion.mtCuota);
	        		}
	            }
	        	mtCuotaTotal = parseFloat(mtCuotaTotal).toFixed(2);
				if (mtCuotaTotal > 0) {
					fraseCierre = fraseCierre + " con un costo mensual total de $ " + mtCuotaTotal;
					fraseCierre = fraseCierre + " a debitarse " + $scope.fraseCierreMedioPago() + ". ";
				}
	
				if($scope.poliza.hasOwnProperty('desempleo')){
	        		if ($scope.poliza.desempleo.isPP) {
	        			fraseCierre = fraseCierre + "\n\nRecuerde que comenzará a gozar de la cobertura de Protección de Pagos ";
	        		} else {
	        			fraseCierre = fraseCierre + "\n\nRecuerde que comenzará a gozar de la cobertura de Gastos Protegidos ";
	        		}
	
					fraseCierre = fraseCierre + "transcurridos los 30 días corridos desde el alta de su seguro. Asimismo, tenga en consideración que en caso de siniestro el pago se realizará si su condición de incapacidad/desempleo se mantiene por más de 30 días ";
	
					if ($scope.poliza.desempleo.isPP) {
	        			fraseCierre = fraseCierre + "con un tope de hasta $" + parseFloat($scope.poliza.desempleo.selCotizacion.sumaAsegurada) + ".-";
	        		} else {
	        			fraseCierre = fraseCierre + "por un plazo máximo de 6 meses, hasta la suma máxima asegurada que le acaba de ser informada.";
	        		}
				}
	
				if($scope.poliza.hasOwnProperty('autos')) {
					if ($scope.poliza.autos.selCotizacion.cdRamo == 36)
						fraseCierre = fraseCierre + "\n\nLa cobertura del seguro de auto comenzará a regir a partir de las 12hs del día de inicio de vigencia.";
				}
				fraseCierre = fraseCierre + "\n\nLe informo, además, que cuenta con los canales de Online Banking y WEB del banco para ingresar la Solicitud de Baja de su seguro.";
			}
			
			fraseCierre = fraseCierre + "\n\n¿Confirma la operacion?";

    		if(confirm(fraseCierre)){
    			if($scope.isVerificaDigital)
    				$scope.sendVerification();
    			else
    				$scope.emit();
    		} else {
    			$scope.backStep();
    		}
        };


        $scope.openDDJJS = function(){
        	
        	var params = "format=popup";
        	
        	params += "&tpDoc=" + $scope.asegurado.tpDocRector;
        	params += "&nuDoc=" + $scope.asegurado.nuDoc;
        	params += "&feNac=" + $scope.asegurado.feNac;
        	params += "&cdProd=" + $scope.poliza.vida.selCotizacion.cdProducto;
        	params += "&mtPoliza=" + $scope.poliza.vida.selCotizacion.sumaAsegurada;
        	params += "&cdProfesion=" + $scope.asegurado.cdProfesion;
        	params += "&nmAseg=" + $scope.asegurado.apeCli + "," + $scope.asegurado.nmCli;
        	params += "&sexAseg=" + $scope.asegurado.inSexo;
        	params += "&telAseg=" + $scope.asegurado.nuTelefono;
        	params += "&domAseg=" + $scope.asegurado.domicilio;
        	
        	var win = window.open("/healthDeclaration.do?" + params, "newDjs", "location=no,menubar=no,toolbar=no,scrollbars=yes,resizable=yes,width=900,height=600");
        };
        
        $scope.deleteCotizacion = function(cdRamo){
        	
        	var promis = issueRepo.delCotiEmit(cdRamo);
    		promis.then(function(result){
    			if(result.status == '200'){
    				cotizadorServ.deleteCotizacion(cdRamo);
    				$scope.poliza.countPolizas -= 1;
    				
    				var keysPoliza = Object.keys($scope.poliza);
    				
    				for(var i=0; i < keysPoliza.length; i++){
    					var findIndex = $scope.poliza[keysPoliza[i]].cdRamo == cdRamo;
    					if (findIndex){
    						delete $scope.poliza[keysPoliza[i]];
    						break;
    					}
    				}
    				
    				if(cdRamo >= 30 && cdRamo <=39){
    					$scope.poliza.valAuto = false;
    				} else {
    					if($scope.poliza.countPolizas == 1){
    						$scope.poliza.valNormal = false;
    					}
    				}
    				
    				$scope.errorEmit = "";
    				if($scope.poliza.countPolizas == 0){
    					$scope.emit();
    				}
    			};
    		}, function(){ 
    			$scope.errorEmit = 'Se produjo un error al emitir, al eliminar la cotizacion.';
    		});
        };
        
        $scope.backStep = function(){
        	$scope.stepId = $scope.stepId - 1;
        	$scope.errorEmit = '';
        	console.log($scope.stepId);
        };
        
        $scope.nextStep = function(){
        	$('.loadingSVG').show();
    		$('.container-fluid').addClass('loadingFx');
    		$timeout(function(){
    			$scope.isVerificaDigital=false;
    				nextStepVal();
        	});
		};
		
		 //PopUp aviso!
        $scope.showAdvice = function(message, errorList1, errorList2, errorList3, errorList4, titleOne, titleTwo, titleThree, titleFour){
        	$mdDialog.show({
                locals: {
                    list1: errorList1,
                    list2: errorList2,
                    list3: errorList3,
                    list4: errorList4,
                    title1: titleOne,
                    title2: titleTwo,
                    title3: titleThree,
                    title4: titleFour,
                    callback: function(){}
                },
        		controller: dialogModalController,
        		templateUrl: './src/pricing/modal/modalAlertDecisionIterate.html',
        		parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen
        	});
        };
        
        var dialogModalController = ['$scope', '$mdDialog', 'list1', 'list2', 'list3', 'list4', 'title1', 'title2', 'title3', 'title4', 'callback', 
        							function($scope, $mdDialog, list1, list2, list3, list4, title1, title2, title3, title4, callback){
    		$scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.modalAdvice = "Aviso Aceptacion Digital.";
            $scope.modalMessage1 = list1;
            $scope.modalMessage2 = list2;
            $scope.modalMessage3 = list3;
            $scope.modalMessage4 = list4;
            $scope.modalTitle1 = title1;
            $scope.modalTitle2 = title2;
            $scope.modalTitle3 = title3;
            $scope.modalTitle4 = title4;
            $scope.avisoEnterado = function(){
            	$scope.hide();
            	$timeout(function() {
            	});
            };
    	}];
        
        $scope.convertDate = function(val){
        	if(val.length == 8){
        		var d = val.substring(6, 8);
            	var m = val.substring(4, 6);
            	var y = val.substring(0, 4);
            	return d+'/'+m+'/'+y;
        	}else
        		return val;
        	
        }
		
		$scope.verificaDigital = function(){
			$('.loadingSVG').show();
    		$('.container-fluid').addClass('loadingFx');
			var cotizacionesParam= [];
			$scope.cotizaciones.forEach(function(cotizacion) {
				var paramData ={}
				
				paramData.ramo = cotizacion.cdRamo;
				paramData.codigoSucursal=  cotizacion.cdSuc;					
				paramData.numeroCotizacion= cotizacion.nuCotizacion;
				paramData.codigoUsuario= cotizacion.cdUsuario;
				if($scope.medioPago.optionFormaPago == "1"){
					$scope.cuentas.forEach(function(item){
						if($scope.medioPago.cuentaSantander==item.ctaTarjetaRector){
							paramData.tipoCuenta = item.tpCtaRector;
						}
					});				
				}else{
					if($scope.medioPago.optionFormaPago == "2"){
						paramData.tipoCuenta = $scope.medioPago.tarjOtroBanco;
					}else{
						paramData.tipoCuenta= "";
					}	
				}
				paramData.numeroCuenta= $scope.medioPago.cuentaSantander!=""?$scope.medioPago.cuentaSantander:$scope.medioPago.tarjOtroBancoNro;					
				paramData.fechaInicio= $scope.poliza.vigencia;						
				paramData.numeroNupTomador= $scope.asegurado.nup;				
				paramData.tipoDocTomador= cotizacion.tpDoc;				
				paramData.numeroDocTomador= $scope.asegurado.nuDoc;					
				paramData.fechaNacTomador= $scope.convertDate($scope.asegurado.feNac);					
				paramData.codigoProvTomador= $scope.asegurado.cdProvincia;					
				paramData.codigoLocalidadTomador= $scope.asegurado.cdCiudad; 			
				paramData.codigoPostalTomador= $scope.asegurado.cdPostal; 			
				paramData.tipoDocAsegurado=	$scope.asegurado.tpDocRector;				
				paramData.numeroDocAsegurado= $scope.asegurado.nuDoc;				
				paramData.fechaNacAsegurado= $scope.convertDate($scope.asegurado.feNac);	
				paramData.montoSumaAsegurada = cotizacion.mtSumaAseg;
				if( $scope.poliza.beneficiarios.length > 0){
					paramData.nombreBeneficiario1=  $scope.poliza.beneficiarios[0].nmBeneficiario;				
					paramData.tipoDocBeneficiario1= $scope.poliza.beneficiarios[0].tpDoc;			
					paramData.numeroDocBeneficiario1= $scope.poliza.beneficiarios[0].nuDoc; 			
					paramData.porcentajeParticipacionBenef1= $scope.poliza.beneficiarios[0].nuParticipacion; 		
					paramData.parentescoBenef1= $scope.poliza.beneficiarios[0].tpParentezco; 				
					paramData.nombreBeneficiario2= $scope.poliza.beneficiarios[1].nmBeneficiario;				
					paramData.tipoDocBeneficiario2= $scope.poliza.beneficiarios[1].tpDoc;			
					paramData.numeroDocBeneficiario2= $scope.poliza.beneficiarios[1].nuDoc; 			
					paramData.porcentajeParticipacionBenef2= $scope.poliza.beneficiarios[1].nuParticipacion; 		
					paramData.parentescoBenef2= $scope.poliza.beneficiarios[1].tpParentezco; 				
					paramData.nombreBeneficiario3= $scope.poliza.beneficiarios[2].nmBeneficiario;				
					paramData.tipoDocBeneficiario3= $scope.poliza.beneficiarios[2].tpDoc;			
					paramData.numeroDocBeneficiario3= $scope.poliza.beneficiarios[2].nuDoc; 			
					paramData.porcentajeParticipacionBenef3= $scope.poliza.beneficiarios[2].nuParticipacion; 		
					paramData.parentescoBenef3= $scope.poliza.beneficiarios[2].tpParentezco; 				
					paramData.nombreBeneficiario4= $scope.poliza.beneficiarios[3].nmBeneficiario;				
					paramData.tipoDocBeneficiario4= $scope.poliza.beneficiarios[3].tpDoc;			
					paramData.numeroDocBeneficiario4= $scope.poliza.beneficiarios[3].nuDoc; 			
					paramData.porcentajeParticipacionBenef4= $scope.poliza.beneficiarios[3].nuParticipacion; 	 	
					paramData.parentescoBenef4= $scope.poliza.beneficiarios[3].tpParentezco; 				
					paramData.nombreBeneficiario5= $scope.poliza.beneficiarios[4].nmBeneficiario;				
					paramData.tipoDocBeneficiario5= $scope.poliza.beneficiarios[4].tpDoc;			
					paramData.numeroDocBeneficiario5= $scope.poliza.beneficiarios[4].nuDoc; 			
					paramData.porcentajeParticipacionBenef5= $scope.poliza.beneficiarios[4].nuParticipacion; 	 	
					paramData.parentescoBenef5= $scope.poliza.beneficiarios[4].tpParentezco; 	
				}
				if(cotizacion.cdRamo === "21" || cotizacion.cdRamo === "22"){
					paramData.observaciones= $scope.poliza.vivienda.alarma;
				}else{
					paramData.observaciones= "";
				}				 					
				paramData.ingresosAsegurado= $scope.asegurado.mtIngresosAseg; 				
				paramData.codigoRiesgoAsegurado= $scope.cdRiesgoTomador; 			
				paramData.numeroNupAsegurado= $scope.asegurado.nup; 				
				paramData.codigoProvAsegurado= $scope.asegurado.cdProvincia; 				
				paramData.codigoLocalidadAsegurado= $scope.asegurado.cdCiudad; 			
				paramData.codigoPostalAsegurado= $scope.asegurado.cdPostal; 			
				paramData.frecuenciaDevolucion= $scope.frDevolucion; 			
				paramData.numeroDePoliza= ""; 					
				paramData.numeroCertificado= ""; 					
				paramData.codigoUsuarioConexion= "0";
				if(cotizacion.cdRamo === "18"){
					paramData.numeroDjs= $scope.poliza.vida.nuDJS;	
				}
				//Exclusivo AUTO
				var ramosAuto = ["30", "31", "32", "33", "35", "36", "39", "40"];
				if(ramosAuto.indexOf(cotizacion.cdRamo) > -1){
					paramData.codigoProducto = cotizacion.cdProducto;
					paramData.codigoPostalL1 = 0;	
					paramData.codigoPostalL3 = 0;	
					paramData.codigoMarca = cotizacion.cdMarca;	
					paramData.codigoModelo = cotizacion.cdModelo;	
					paramData.anioVehiculo = cotizacion.nuAnio;	
					paramData.codigoGarage = cotizacion.inGarage;	
					paramData.codigoRastreador = cotizacion.inRastreador;
					paramData.codigoUsoAuto = cotizacion.cdUso;
					paramData.marcaEmpleado = cotizacion.inEmpleado;
					paramData.nmSolicitante = cotizacion.apellidoCli+", "+cotizacion.nombreCli;
					paramData.tipoGnc = cotizacion.tpGnc;
					paramData.montoSumaAsegurada = cotizacion.mtSumaAseg;	
					paramData.montoSumaGnc = cotizacion.sumaGnc;
					paramData.montoSumaRobo = cotizacion.mtSumaRobo;
					paramData.tipoIva = cotizacion.tpIva;
					paramData.tipoCobertura = cotizacion.tpCobertura ;
					paramData.esCeroKm = cotizacion.inOkm;	
					paramData.codigoSexo = cotizacion.cdSexo;
					paramData.codigoEstadoCivil = cotizacion.cdEdoCivil;
					paramData.numeroSec = "";	
				}
				cotizacionesParam.push(paramData);
			});
				
			$timeout(function() {
				
	        	var promis = issueRepo.sendValidacionesAceptacionDigitalList(cotizacionesParam, $scope.endpointAd);
	    		promis.then(function(result){
	    			console.log(result.data.listadoErroresVida);
	    			console.log(result.data.listadoErroresAp);
	    			console.log(result.data.listadoErroresAuto);
	    			console.log(result.data.listadoErroresVivienda);
	    			if(!result.data.estadoValido){
	    				$scope.showAdvice("mensaje", result.data.listadoErroresVida, result.data.listadoErroresAp, 
	    						result.data.listadoErroresAuto, result.data.listadoErroresVivienda,"Vida","Accidentes Personales","Auto", "Vivienda");
	    			}else{
	    	    		$timeout(function(){
	    	    			$scope.isVerificaDigital=true;
	    	    				nextStepVal();
	    	        	});
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
		
        
        var nextStepVal = function(){
        	
        	var valStep = true;
        	initValidations();
        	
        	if($scope.stepId == 1){
        		
        		
        		if($scope.persFisica){
        			
        			var searchPaisNacimiento = $('#idPaisNacimiento').val();
        			var searchPaisNacionalidad = $('#idPaisNacionalidad').val();
        			
	        		$scope.valDePaisNacimiento = $scope.asegurado.cdPaisNacimiento != undefined && $scope.asegurado.cdPaisNacimiento.trim().length > 0;
	        		$scope.valDePaisNacimiento = searchPaisNacimiento != undefined && searchPaisNacimiento.trim().length > 0;
	        		
	        		$scope.valDePaisNacionalidad = $scope.asegurado.cdPaisNacionalidad != undefined && $scope.asegurado.cdPaisNacionalidad.trim().length > 0;
	        		$scope.valDePaisNacionalidad = searchPaisNacionalidad != undefined && searchPaisNacionalidad.trim().length > 0;
	        		
	        		$scope.valNuTelefonoStep1 = $scope.asegurado.nuTelefono != undefined && $scope.asegurado.nuTelefono.trim().length > 0;
	        		$scope.valDomCalleStep1 = $scope.asegurado.domCalle != undefined && $scope.asegurado.domCalle.trim().length > 0;
	        		
	        		valStep = valStep && $scope.valDomCalleStep1 && $scope.valNuTelefonoStep1 && $scope.valDePaisNacimiento && $scope.valDePaisNacionalidad;
    			
        			
        		} else {
        			
	        		$scope.valFeInscrRegJurid = $scope.asegurado.feInscrRegJurid != undefined;
	        		$scope.valFeConstJurid = $scope.asegurado.feConstJurid != undefined;
	        		$scope.valNumInscrRegJurid = $scope.asegurado.numInscrRegJurid != undefined && $scope.asegurado.numInscrRegJurid.trim().length > 0;
	        		
	        		valStep = valStep && $scope.valFeInscrRegJurid && $scope.valFeConstJurid && $scope.valNumInscrRegJurid;
	        		
        		}

        		if($scope.asegurado.diMail == undefined){ $scope.asegurado.diMail = '';};
        		$scope.valDiMail = (!$scope.asegurado.checkMail || ($scope.asegurado.checkMail && $scope.asegurado.diMail.trim().length > 0 && $scope.mailValido));
        		
        		valStep = valStep && $scope.valDiMail;
        		
        		if($scope.asegurado.diMail!=$scope.clientMail && $scope.clientMail!="" )
        			$scope.showAlert()
        		
        		if(valStep){
        			$timeout(function(){
        				afterStep1();
        			});
        		}
        	}
        	
        	if($scope.stepId == 2){
        		
        		$scope.isAceptacionDigital=allowDigitalVerify($scope.cotizaciones[0].cdSuc);
        		$scope.valOrigFondo = $scope.medioPago.origFondo.trim().length > 0;
        		$scope.valMotivo = $scope.medioPago.optionDDJJ == 'n' || ($scope.medioPago.optionDDJJ == 's' && $scope.medioPago.motivo.trim().length > 0);
        		$scope.valDDJJLegal = $scope.medioPago.checkLegal == true;
        		$scope.valIngresos = $scope.asegurado.inCliente == 'CLI' || $scope.medioPago.ingresos.trim().length > 0;

        		$scope.valOptionFormaPago = $scope.medioPago.optionFormaPago == 1 && $scope.medioPago.cuentaSantander.trim().length > 0;
        		$scope.valOptionFormaPago = $scope.valOptionFormaPago || ($scope.medioPago.optionFormaPago == 2 && $scope.medioPago.tarjOtroBanco.trim().length > 0 && $scope.medioPago.tarjOtroBanco == 'A' && $scope.medioPago.tarjOtroBancoNro.trim().length == 15);
        		$scope.valOptionFormaPago = $scope.valOptionFormaPago || ($scope.medioPago.optionFormaPago == 2 && $scope.medioPago.tarjOtroBanco.trim().length > 0 && $scope.medioPago.tarjOtroBanco != 'A' && $scope.medioPago.tarjOtroBancoNro.trim().length == 16);
        		$scope.valOptionFormaPago = $scope.valOptionFormaPago || ($scope.medioPago.optionFormaPago == 3 && $scope.medioPago.cuentaOtroBancoCbu.trim().length == 22);
        		$scope.regexPatente =/^([\n\Ñ\w])([\n\Ñ\w]|[\/])([\n\Ñ\w])([0-9]{3})|([\n\Ñ\w]{2})([0-9]{3})([\n\Ñ\w]{2})|([\n\Ñ\w]{1})([0-9]{3})([\n\Ñ\w]{3})|([0-9]{3})([\n\Ñ\w]{3})$/;

        		valStep = valStep && $scope.valOrigFondo && $scope.valMotivo && $scope.valDDJJLegal && $scope.valIngresos && $scope.valOptionFormaPago;
        		
        		if(valStep){
        			$timeout(function(){
        				afterStep2();
        			});
        		}
        	}
        	
        	if($scope.stepId == 3){
        		
        		if($scope.poliza.valNormal){
    				$scope.valVigencia = $scope.poliza.vigencia != undefined;
    				valStep = valStep && $scope.valVigencia;

    			}
        		
        		if($scope.poliza.vida != undefined && $scope.poliza.vida.isDjsProd){
        			$scope.valNuDJS = $scope.poliza.vida.nuDJS != undefined && $scope.poliza.vida.nuDJS.trim().length > 0;
        			valStep = valStep && $scope.valNuDJS;
        		}
        		
        		if($scope.poliza.desempleo != undefined && $scope.poliza.desempleo.isPP){
    			 $scope.valTarjetasAsegPP = $scope.selectedTarjetaPP != undefined;
    			 valStep = valStep && $scope.valTarjetasAsegPP;
        		}

        		if($scope.poliza.robo != undefined){
        			
        			$scope.valTarjetasAsegRC = false;
	        		
	        		for(var i=0; i < $scope.tarjetasAsegRC.length; i++){ 
	        			if($scope.tarjetasAsegRC[i].check){
	        				$scope.valTarjetasAsegRC = true;
	        				break;
	        			}
	        		};
	        		
	        		valStep = valStep && $scope.valTarjetasAsegRC;
        		}
        		
        		if($scope.poliza.vivienda != undefined){
        			$scope.valDomicilio = $scope.poliza.vivienda.domCalle != undefined && $scope.poliza.vivienda.domCalle.trim().length > 0;
        			valStep = valStep && $scope.valDomicilio;
        		}
        		
        		if($scope.poliza.compraProt != undefined){
	        		
	        		$scope.valTarjetasAsegCompra = false;
	        		
	        		for(var i=0; i < $scope.tarjetasAsegCP.length; i++){ 
	        			if($scope.tarjetasAsegCP[i].check){
	        				$scope.valTarjetasAsegCompra = true;
	        				break;
	        			}
	        		};
	        		
	        		valStep = valStep && $scope.valTarjetasAsegCompra;
        		}
        		
        		if($scope.poliza.autos != undefined){
        			$scope.valVigenciaAuto = $scope.poliza.vigenciaAuto != undefined;
        			$scope.valDomicilio = $scope.poliza.autos.domCalle != undefined && $scope.poliza.autos.domCalle.trim().length > 0;
        			$scope.valNuChasis = $scope.poliza.autos.nuChasis != undefined && $scope.poliza.autos.nuChasis.trim().length > 0;
	        		$scope.valNuPatente = $scope.poliza.autos.nuPatente != undefined && $scope.poliza.autos.nuPatente.trim().length > 0;
	        		$scope.valKm = $scope.poliza.autos.km != undefined && $scope.poliza.autos.km.trim().length > 0;
	        		$scope.valInspec = ($scope.poliza.autos.telInspec != undefined && $scope.poliza.autos.telInspec.trim().length > 0) || $scope.poliza.autos.selCotizacion.inInspeccion != 'S';
	        		$scope.valNuMotor = $scope.poliza.autos.nuMotor != undefined && $scope.poliza.autos.nuMotor.trim().length > 0;
	        		
	        		valStep = valStep && $scope.valVigenciaAuto && $scope.valDomicilio && $scope.valNuChasis && $scope.valNuPatente && $scope.valKm && $scope.valNuMotor && $scope.valInspec;
	        		
	        		if($scope.poliza.autos.tpGnc != 'N'){
		        		$scope.valMarcaRegGnc = $scope.poliza.autos.marcaRegGnc != undefined;
		        		//A pedido de D.Tossi solo se deja marca regulador
		        		//$scope.valNuObleaGnc = $scope.poliza.autos.nuObleaGnc != undefined;
		        		//$scope.valTallerMonGnc = $scope.poliza.autos.tallerMonGnc != undefined;
		        		//$scope.valNuSerieGnc = $scope.poliza.autos.nuSerieGnc != undefined;
		        		//$scope.valFeDesdeGnc = $scope.poliza.autos.feDesdeGnc != undefined;
		        		//$scope.valFeHastaGnc = $scope.poliza.autos.feHastaGnc != undefined;
		        		
		        		valStep = valStep && $scope.valNuObleaGnc && $scope.valTallerMonGnc && $scope.valMarcaRegGnc && $scope.valNuSerieGnc
		        			&& $scope.valFeDesdeGnc && $scope.valFeHastaGnc;
	        		}
        		}
        	}
        	
        	
        	if(valStep){
        		$scope.stepId = $scope.stepId + 1;
        		if($scope.stepId > 3)
        			{
        				
        				$scope.fraseCierreVentaPorRamo();	
        				
        			}
        	} else {
        		$scope.errorEmit = "Los datos ingresados son erroneos o estan incompletos.";
        	}
        	
        	$('.loadingSVG').hide();
    		$('.container-fluid').removeClass('loadingFx');
        };
        
        $scope.showAnexo = function(){
            // este selector apunta al boton cerrar en el jsp de anexo legal
            var buttonCloseSelector = '#uifDDJJ [type="button"]';
            $('body').delegate(buttonCloseSelector, 'click', function(ev){
                ev.preventDefault();
                $mdDialog.hide();
            });

            $mdDialog.show({
                onComplete:function(){
                    //remove inline oncick event
                    $(buttonCloseSelector).prop('onclick',null);
                },
                templateUrl: '/agents/report/instructiveUIF.jsp',
                clickOutsideToClose: true
            });
        };

        $scope.onlyCreditCard = function(item){
            return item.tpCtaRector != "5"; // debito
        };
        
        $scope.redirect = function(view){ window.location.href = window.location.origin + view;};
        
        $scope.salir2 = function(){
        	sessionStorage.refresh = "true";
        	sessionStorage.asegurado = JSON.stringify(customerServ.getUser());
        	sessionStorage.cotizaciones = JSON.stringify(cotizadorServ.getCotizaciones());
        };
        
        $scope.salir = function(){
        	if(confirm("¿Está seguro que desea salir de esta página?")){
	        	cotizadorServ.reset();
	        	formEmitServ.reset();
	        	customerServ.resetUser();
	        	formsRepo.getLogout(function (data){});
	        	sessionStorage.clear();
	    		window.location.href = window.location.origin + "/menuTree.do";
        	}
        };
        
        $scope.selectCard = function(card){
        	if(card.mensaje.trim().length > 0){
        		return;
        	}
        	
        	$scope.selectedTarjetaPP = card;
        };


        if(sessionStorage.refresh){
        	customerServ.setUser(JSON.parse(sessionStorage.asegurado));
        	cotizadorServ.realSetCotizaciones(JSON.parse(sessionStorage.cotizaciones));
        }
        
		sessionStorage.clear();
		asegurado = customerServ.getUser();
		
		var nup=asegurado.nup
		var tpDoc=asegurado.tpDocRector
		var nuDoc=asegurado.nuDoc
		formsRepo.getMailClient(function(data){ $scope.clientMail = data; }, nup,  tpDoc, nuDoc );
		
    	var coti = {};
        var listCotis = cotizadorServ.getCotizaciones();;
        for(var i in listCotis){
        	coti = listCotis[i];
        	switch(coti.selCotizacion.cdRamo) {
	            case '32':
	            case '35':
	            case '39':
	            	$scope.conMailAutos = false;
	                break;
	            default:
	            	$scope.conMailAutos = true;
	                break;
	        };
        };
		
    	formsRepo.getAllDocumentos(function (data) {
			documentos = data;
		
			if(asegurado.feNac != '' && asegurado.feNac != undefined){
	        	var feNac = asegurado.feNac;
	            $scope.feNacDatepicker = moment(feNac).toDate();
	        }
	        
	        if(asegurado.nuCuitCuil != undefined){//Defino si es persona fisica o juridica
	        	var prefijo = asegurado.nuCuitCuil.substring(0, 2);
		        if(prefijo == '30' || prefijo == '33' || prefijo == '34'){
		        	$scope.persFisica = false;
		        }else{
		        	$scope.persFisica = true;
		        };
	        };
	        
	        documentos.forEach(function(element, index, array){
				if(element.valor == asegurado.tpDoc){
					descDoc = element.descripcion;
				}
			});
			
			asegurado.checkMail = asegurado.checkMail == undefined || asegurado.checkMail;
			
			issueRepo.getAllPaises(function(data){ 
				$scope.paises = data;
				
        		initValidations();

        		$scope.descDoc = descDoc;
        		$scope.descCiudad = asegurado.deCiudad + '(' + asegurado.cdPostal+ ')';
        		
        		$scope.searchTextLugar = asegurado.dePaisNacimiento || '';
        		$scope.searchTextNacionalidad = asegurado.dePaisNacionalidad;
        		
        		$scope.asegurado = asegurado;
        		
        		$timeout(function(){
        			$scope.documentos = documentos;
        			$scope.finish1 = true;
        			$('.loadingSVG').hide();
        			$('.container-fluid').removeClass('loadingFx');
        		});
        		
			});
		});
    	
    	//verificacion mail
    	$scope.validaMailEstilo = function(){
    		$scope.mailValido=verificarMail($scope.asegurado.diMail);
    	};	

	}];

})();
