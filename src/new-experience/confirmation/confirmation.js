(function () {
    angular.module('confirmation', [])
        .directive('confirmation', function () {
            console.log('Hola directiva de confirmacion');
            return {
                restrict: 'E',
                templateUrl: './src/new-experience/confirmation/confirmation.html',
                controller: confirmationController,
                replace: true
            };
        })
        .service('confirmationServ', function () {
        });

    var confirmationController = ['$rootScope', '$timeout', '$scope', 'formsRepo', 'issueRepo', 'menuRamosServ', 'customerServ', 'cotizadorServ', 'formEmitServ', '$location', '$mdDialog', '$mdToast', 'confirmationServ', 'resumeServ', 'menuExperienceServ', 'gaService', function ($rootScope, $timeout, $scope, formsRepo, issueRepo, menuRamosServ, customerServ, cotizadorServ, formEmitServ, $location, $mdDialog, $mdToast, confirmationServ, resumeServ, menuExperienceServ, gaService) {

        $scope.isVerificaDigital = false;
        $rootScope.aceptacionDigitalRoot = false;
        $scope.dataUser = $scope.cotizacion.dataUser;
        $scope.asegurado = $scope.cotizacion.dataUser;
        $scope.cotizacion = $rootScope.cotizacion;
        $scope.dataUserSuc = $rootScope.cotizacion.dataUserSuc;
        $scope.cotiVivienda = $rootScope.cotizacion.cotiVivienda

        $scope.coberturas = $rootScope.cotizacion.cotiVivienda.coberturas;
        $scope.asistencias = $rootScope.cotizacion.cotiVivienda.asistencias;

        $scope.costoTotalMensual = $scope.cotiVivienda.planPersonalizado.mtCuota;
        $scope.costoTotal = $scope.cotiVivienda.planPersonalizado.mtCuota;

        $scope.clientMail = $scope.dataUser.diMail;

        $scope.polizaD = $scope.cotiVivienda.firstPricing;
        $scope.planPersonalizado = $rootScope.cotizacion.cotiVivienda.planPersonalizado;
        $scope.esAceptacionDigital = false;
        $scope.esEmision = false;

        $scope.persFisica = false;


        $scope.flagAceptacionDigital = false;
        $scope.flagAllow = "true";
        $scope.ramosAllow = "";
        $scope.canalesNotAllow = "977,992,990,914,999,979,975,974,973,998,28,7";
        $scope.tpDocsNotAllow = "L,T";
        //Data bien asegurado
        $scope.bienAsegurado = $rootScope.cotizacion.dataUser.bienAsegurado;


        formsRepo.getAceptacionDigitalActive(function (data) { $scope.flagAllow = data[0].valor });

        formsRepo.getAceptacionDigitalRamos(function (data) { $scope.ramosAllow = data[0].valor });

        formsRepo.getAceptacionDigitalCanales(function (data) { $scope.canalesNotAllow = data[0].valor });

        formsRepo.getAceptacionDigitalDocs(function (data) { $scope.tpDocsNotAllow = data[0].valor });



        $scope.showHide = function (params) {
            params.show = !params.show;
        }


        $scope.showModalAsistencia = function (asistencia) {

            var params = {
                title: asistencia.desc,
                description: asistencia.desc_larga,
                nameIcon: 'iconViviendaActive.svg'
            }

            $mdDialog.show({
                locals: {
                    infoParams: params,
                },
                controller: "ctrModalInnerHTML",
                templateUrl: './src/new-experience/modal-innerHTML/modal-innerHTML.html',
                clickOutsideToClose: true,
                multiple: true,
            });

        }


        var allowDigitalVerify = function allowDigitalVerify(channel) {
            var docTypeExclude = $scope.tpDocsNotAllow.split(",");
            var channelsExclude = $scope.canalesNotAllow.split(",");
            var ramos = $scope.ramosAllow.split(",");
            var foundDoc = false;
            var foundChannel = false;

            docTypeExclude.forEach(function (element) {
                if (element == $scope.asegurado.tpDoc)
                    foundDoc = true;
            });

            channelsExclude.forEach(function (element) {

                if (element == channel)
                    foundChannel = true;

            });


            var isRamo = true;

            var notClient = false;
            if ($scope.cotiVivienda.nuNup == undefined || $scope.cotiVivienda.nuNup == '0')
                notClient = true

            if ($scope.dataUser.nuCuitCuil != undefined) {//Defino si es persona fisica o juridica
                var prefijo = $scope.dataUser.nuCuitCuil.substring(0, 2);
                if (prefijo == '30' || prefijo == '33' || prefijo == '34') {
                    $scope.persFisica = false;
                } else {
                    $scope.persFisica = true;
                };
            };


            if (foundDoc || foundChannel || !$scope.persFisica || $scope.flagAllow != "true" || !isRamo || notClient)
                return false;

            return true
        };


        $scope.flagAceptacionDigital = allowDigitalVerify($scope.cotiVivienda.cotiVivienda);

        var sendDigitalVerification = function () {

            var formularioPolizaVO = formEmitServ.getPolizaOld(); //esto falta


            issueRepo.setDigitalVerification(formularioPolizaVO).
                then(function (result) {

                    if (result.status == '200' || result.status == '201') {

                        //$scope.asegurado.hash=result.data.hash; revisar

                        // var polizaPropertiesList=['accPersonales', 'robo', 'desempleo', 'vida', 'vivienda', 'intConsorcio', 'protSalud', 'protCartera', 'compraProt', 'autos'  ];

                        // polizaPropertiesList.forEach(function(polizaType) {
                        // if($scope.poliza.hasOwnProperty(polizaType)){
                        item = {}// ARMAR OBJETO new ItemWraped($scope.poliza[polizaType].cdRamo);
                        item.cdRamo = 21
                        item.asyncIsDone = true;
                        var vigencia = $rootScope.cotizacion.dataUser.poliza.vigencia; //$scope.polizaD.vigencia;

                        item.poliza = {
                            "compania": $scope.polizaD.deCompania,
                            "deProducto": $scope.polizaD.deRamo,
                            "titular": $scope.asegurado.apeCli + ", " + $scope.asegurado.nmCli,
                            "nuPoliza": "N",
                            "nuCertificado": "A",
                            "nuPolizaAuto": "N/A",
                            "vigencia": vigencia,
                            "estado": "PENDIENTE DE ACEPTACION DIGITAL"
                        }
                        var polizaAux = [];
                        polizaAux.push(item)
                        resumeServ.setPoliza(polizaAux);
                        //resumeServ.updatePoliza(item); // REVISAR
                        //}
                        // })

                        if (result.status == '201')
                            alert(result.data.message);

                        // $location.url('/issue/poliResume');
                        $location.url('/newExperience/resumenPoliza');
                    }
                    else {
                        alert("Hubo un error al enviar la aceptacion digital.\n" + result.data.message);
                    }
                });

        };

        $scope.showAdvice = function (message, errorList1, errorList2, errorList3, errorList4, titleOne, titleTwo, titleThree, titleFour) {
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
                    callback: function () { }
                },
                controller: dialogModalController,
                templateUrl: './src/pricing/modal/modalAlertDecisionIterate.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen
            });
        };


        var dialogModalController = ['$scope', '$mdDialog', 'list1', 'list2', 'list3', 'list4', 'title1', 'title2', 'title3', 'title4', 'callback',
            function ($scope, $mdDialog, list1, list2, list3, list4, title1, title2, title3, title4, callback) {
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
                $scope.avisoEnterado = function () {
                    $scope.hide();
                    $timeout(function () {
                    });
                };
            }];

        $scope.formattedDate = function (fechaParams) {
            var d = new Date(fechaParams);
            let month = String(d.getMonth() + 1);
            let day = String(d.getDate());
            const year = String(d.getFullYear());
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            return (day + '/' + month + '/' + year);
        }

        if ($scope.cotizacion.dataUser.formaDePago.banco.otro.checked == true) {
            $scope.tpCtaRector = $scope.cotizacion.dataUser.formaDePago.banco.otro.listado.tipo;
            $scope.deTpCtaRector = $scope.cotizacion.dataUser.formaDePago.banco.otro.listado.descripcion;
            $scope.ctaTarjetaFormato = $scope.cotizacion.dataUser.formaDePago.banco.otro.nro;
        } else {
            $scope.tpCtaRector = $scope.cotizacion.dataUser.formaDePago.banco.santander.listado.tpCtaRector;
            $scope.deTpCtaRector = $scope.cotizacion.dataUser.formaDePago.banco.santander.listado.deTpCtaRector;
            $scope.ctaTarjetaFormato = $scope.cotizacion.dataUser.formaDePago.banco.santander.listado.ctaTarjetaFormato;
            $scope.ctaTarjetaRector = $scope.cotizacion.dataUser.formaDePago.banco.santander.listado.ctaTarjetaRector;
            $scope.ctaTarjetaFormatoProtegido = $scope.cotizacion.dataUser.formaDePago.banco.santander.listado.ctaTarjetaFormatoProtegido
        }

        $scope.polizaAceptacionDigital = {
            alarmaViv: $rootScope.cotizacion.dataUser.bienAsegurado.alarma,
            beneficiarios: [],
            cargoPep: "",
            cdCiudad: $scope.dataUser.cdCiudad,
            cdMarcaRegulador: "",
            cdPostal: $scope.dataUser.cdPostal,
            cdProvincia: $scope.dataUser.cdProvincia,
            cdRamo: "21",
            cilindros: [],
            debCuentaAlter1: "",
            debCuentaAlter2: "",
            debCuentaAlter3: "",
            debCuentaAlter4: "",
            deCiudad: $scope.dataUser.deCiudad,
            deProvincia: $scope.dataUser.deProvincia,
            descMarcaAuto: "",
            descModeloAuto: "",
            diMail: $scope.dataUser.tomador.contacto.correoElectronico || $scope.dataUser.diMail,
            diMailAlter: "",
            domCalle: $scope.dataUser.tomador.direccionLegal.direccion || $scope.dataUser.domCalle,
            domCalleAuto: "",
            domCalleViv: $scope.dataUser.bienAsegurado.direccion || $scope.dataUser.domCalle,
            domCdCiudad: $scope.dataUser.cdCiudad,
            domCdPostal: $scope.dataUser.cdPostal,
            domCdProvincia: $scope.dataUser.cdProvincia,
            domDeCiudad: $scope.dataUser.deLocalidad,
            domDeProvincia: $scope.dataUser.deProvincia,
            domDepto: $scope.dataUser.tomador.direccionLegal.departamento || $scope.dataUser.domDepto,
            domDeptoAuto: "",
            domDeptoViv: $scope.dataUser.bienAsegurado.departamento || $scope.dataUser.domDepto,
            domNro: $scope.dataUser.tomador.direccionLegal.numero || $scope.dataUser.domNro,
            domNroAuto: "",
            domNroViv: $scope.dataUser.bienAsegurado.numero || $scope.dataUser.domNro,
            domPiso: $scope.dataUser.tomador.direccionLegal.piso || $scope.dataUser.domPiso,
            domPisoAuto: "",
            domPisoViv: $scope.dataUser.bienAsegurado.piso || $scope.dataUser.domPiso,
            entreCallesViv: $scope.dataUser.tomador.direccionLegal.entreCalles || "",
            errMensaje: "",
            errNumber: "",
            feConstitucion: "",
            feDesdeGNC: "",
            feHastaGNC: "",
            feIncripcionRegistral: "",
            feVigenciaAutos: "",
            feVigenciaNormal: $rootScope.cotizacion.dataUser.poliza.vigencia,
            formaPago: {
                apMedioPago: "",
                cdCtaRector: "",
                cdSucCta: "",
                cdTitularidad: "",
                ctaTarjetaFormato: $scope.ctaTarjetaFormato,
                ctaTarjetaFormatoProtegido: "",
                ctaTarjetaRector: $scope.ctaTarjetaRector || $scope.ctaTarjetaFormato,
                deTpCtaRector: $scope.deTpCtaRector,
                feVtoTarjeta: "",
                habilitada: false,    // ?
                inCtaRector: "",
                inTarjeta: "",
                Mensaje: "",
                moneda: "",
                nroCtaContrato: "0",
                nuCBU: "",
                stTarjeta: "",
                tpCtaRector: $scope.tpCtaRector,
                tpCuentaBco: "",
            },
            debCuentaAlter1: $scope.cotizacion.dataUser.formaDePago.banco.alternativo.listado[0] ? $scope.cotizacion.dataUser.formaDePago.banco.alternativo.listado[0].ctaTarjetaRector : '',
            debCuentaAlter2: $scope.cotizacion.dataUser.formaDePago.banco.alternativo.listado[1] ? $scope.cotizacion.dataUser.formaDePago.banco.alternativo.listado[1].ctaTarjetaRector : '',
            debCuentaAlter3: $scope.cotizacion.dataUser.formaDePago.banco.alternativo.listado[2] ? $scope.cotizacion.dataUser.formaDePago.banco.alternativo.listado[2].ctaTarjetaRector : '',
            debCuentaAlter4: $scope.cotizacion.dataUser.formaDePago.banco.alternativo.listado[3] ? $scope.cotizacion.dataUser.formaDePago.banco.alternativo.listado[3].ctaTarjetaRector : '',
            funcPubExt: "N",
            inPep: "N",
            kilometraje: "",
            militaryProd: "N",
            mtIngresos: "",
            nroCertificado: "",
            nroPoliza: "",
            nuChasis: "",
            nuDJS: "",
            nuIncripcionRegistral: "",
            nuMotor: "",
            nuOblea: "",
            nuPatente: "",
            nuSerie: "",
            nuTelefono: $scope.dataUser.tomador.contacto.telefono || $scope.dataUser.nuTelefono,
            origenFondosDDJJ: $scope.dataUser.declaracionJurada.origenDeFondos.valor,
            polizaDigital: "S",
            tallerMontaje: "",
            tarjetasAseguradasCP: [],
            tarjetasAseguradasPP: [],
            tarjetasAseguradasRC: [],
            telInspec: ""
        }

        //finFormularioPolizaVo

        $scope.parametros = {
            cdProvincia: $scope.dataUser.cdProvincia,
            cdCiudad: $scope.dataUser.cdCiudad,
            cdPostal: $scope.dataUser.cdPostal,
            nuTelefono: $scope.dataUser.tomador.contacto.telefono || $scope.dataUser.nuTelefono,
            diMail: $scope.dataUser.tomador.contacto.correoElectronico || $scope.dataUser.diMail,
            polizaDigital: "N",
            origenFondosDDJJ: $scope.dataUser.declaracionJurada.origenDeFondos.valor,
            inPep: "N",
            cargoPep: "",
            funcPubExt: "N",
            militaryProd: "N",
            mtIngresos: "",
            nroPoliza: "",
            nroCertificado: "",
            errNumber: "",
            errMensaje: "",
            cdPaisNacimiento: $rootScope.cotizacion.dataUser.tomador.lugarNacimiento,
            cdPaisNacionalidad: $rootScope.cotizacion.dataUser.tomador.nacionalidad,
            formaPago: {
                tpCuentaBco: "",
                cdSucCta: "",
                ctaTarjetaRector: $scope.ctaTarjetaRector || $scope.ctaTarjetaFormato,
                stTarjeta: "",
                nuCBU: "",
                moneda: "",
                ctaTarjetaFormato: $scope.ctaTarjetaFormato,
                ctaTarjetaFormatoProtegido: $scope.ctaTarjetaFormatoProtegido || "",
                tpCtaRector: $scope.tpCtaRector || "",
                deTpCtaRector: $scope.deTpCtaRector || "",
                cdCtaRector: "",
                inCtaRector: "",
                cdTitularidad: "",
                nroCtaContrato: "00000000"
            },
            debCuentaAlter1: $scope.cotizacion.dataUser.formaDePago.banco.alternativo.listado[0] ? $scope.cotizacion.dataUser.formaDePago.banco.alternativo.listado[0].ctaTarjetaRector : '',
            debCuentaAlter2: $scope.cotizacion.dataUser.formaDePago.banco.alternativo.listado[1] ? $scope.cotizacion.dataUser.formaDePago.banco.alternativo.listado[1].ctaTarjetaRector : '',
            debCuentaAlter3: $scope.cotizacion.dataUser.formaDePago.banco.alternativo.listado[2] ? $scope.cotizacion.dataUser.formaDePago.banco.alternativo.listado[2].ctaTarjetaRector : '',
            debCuentaAlter4: $scope.cotizacion.dataUser.formaDePago.banco.alternativo.listado[3] ? $scope.cotizacion.dataUser.formaDePago.banco.alternativo.listado[3].ctaTarjetaRector : '',
            feIncripcionRegistral: "",
            nuIncripcionRegistral: "",
            feConstitucion: "",
            feVigenciaNormal: $rootScope.cotizacion.dataUser.poliza.vigencia,
            feVigenciaAutos: "",
            domCalleViv: $scope.dataUser.bienAsegurado.direccion || $scope.dataUser.domCalle,
            domDeptoViv: $scope.dataUser.bienAsegurado.departamento || $scope.dataUser.domDepto,
            domNroViv: $scope.dataUser.bienAsegurado.numero || $scope.dataUser.domNro,
            domPisoViv: $scope.dataUser.bienAsegurado.piso || $scope.dataUser.domPiso,
            entreCallesViv: $scope.dataUser.bienAsegurado.entreCalles || "",
            alarmaViv: $rootScope.cotizacion.dataUser.bienAsegurado.alarma,
            tarjetasAseguradasRC: [],
            tarjetasAseguradasCP: [],
            tarjetasAseguradasPP: [],
            nuDJS: "",
            domCalleAuto: "",
            domDeptoAuto: "",
            domNroAuto: "",
            domPisoAuto: "",
            nuChasis: "",
            nuMotor: "",
            nuPatente: "",
            telInspec: "",
            kilometraje: "",
            nuOblea: "",
            cdMarcaRegulador: "",
            tallerMontaje: "",
            nuSerie: "",
            feDesdeGNC: "",
            feHastaGNC: "",
            cilindros: [],
            beneficiarios: [],
            deCiudad: $scope.dataUser.deCiudad,
            deProvincia: $scope.dataUser.deProvincia,
            domCalle: $scope.dataUser.tomador.direccionLegal.direccion || $scope.dataUser.domCalle,
            domNro: $scope.dataUser.tomador.direccionLegal.numero || $scope.dataUser.domNro,
            domPiso: $scope.dataUser.tomador.direccionLegal.piso || $scope.dataUser.domPiso,
            domDepto: $scope.dataUser.tomador.direccionLegal.departamento || $scope.dataUser.domDepto,
            domCdProvincia: $scope.dataUser.cdProvincia,
            domDeProvincia: $scope.dataUser.deProvincia,
            domCdCiudad: $scope.dataUser.cdCiudad,
            domDeCiudad: $scope.dataUser.deLocalidad,
            domCdPostal: $scope.dataUser.cdPostal,
            cdRamo: $scope.cotiVivienda.cdRamo
        }

        $scope.emitir = function () {
            gaService.enviarEvento('emision_emitir');
            $scope.isVerificaDigital = false;
            $scope.esEmision = true;
            $scope.esAceptacionDigital = false;
            formEmitServ.setPolizaOld($scope.parametros);
            $scope.fraseCierreVentaPorRamo();
        }

        $scope.emitirPoliza = function () {
            var emision = formsRepo.setEmit($scope.parametros)
            emision.then(function (data) {
                var polizaEmit = []
                // var poliza = []
                // data.data.asyncIsDone = true;
                // poliza.push(data.data)
                var poliza = {
                    cdRamo: 21,
                    asyncIsDone: true,
                    poliza: data.data
                }
                // data.data.asyncIsDone = true;
                // poliza.push(data.data)
                polizaEmit.push(poliza);
                console.log(polizaEmit);
                resumeServ.setPoliza(polizaEmit);
                formEmitServ.setPoliza(polizaEmit);
                customerServ.setUser($scope.dataUser);
                asegurado = customerServ.getUser();
                console.log(data);
                // $location.url('/issue/poliResume');
                $location.url('/newExperience/resumenPoliza');

            });
        }

        //mensaje por ramo
        $scope.poliza = {
            vivienda: true
        }

        $scope.fraseCierreMedioPago = function () {
            var textoPago = "";

            //adecuar 
            if ($scope.cotizacion.dataUser.formaDePago.banco.otro.checked == true) { //otro banco
                textoPago = "de la " + $scope.cotizacion.dataUser.formaDePago.banco.otro.listado.descripcion + " Nro. " + $scope.cotizacion.dataUser.formaDePago.banco.otro.nro;
            }
            if ($scope.cotizacion.dataUser.formaDePago.banco.santander.checked == true) { //Tarjeta santander
                textoPago = "de la " + $scope.cotizacion.dataUser.formaDePago.banco.santander.listado.deTpCtaRector + " Nro. " + $scope.cotizacion.dataUser.formaDePago.banco.santander.listado.ctaTarjetaFormato;
            }

            return textoPago;
        };

        $scope.fraseCierreVentaPorRamo = function () {
            var fraseCierre = "";
            var valFrases = true;

            if ($scope.poliza.hasOwnProperty('vivienda') && valFrases) {

                if ($scope.isVerificaDigital)
                    fraseCierre = "Sera enviado un mail a " + $scope.clientMail + " para la aceptacion digital del seguro de Vivienda ";
                else
                    fraseCierre = "A partir de este momento damos de alta el seguro de Vivienda ";

                //if ($scope.poliza.vivienda.selCotizacion.cdClasifPlan == "HIP") {
                //    fraseCierre = fraseCierre + "Complemento Hipotecario ";
                // }
                fraseCierre = fraseCierre + "de la compañía Zurich Santander para ";
                if ($scope.dataUser.inSexo == "M") {
                    fraseCierre = fraseCierre + "el Sr. ";
                } else {
                    fraseCierre = fraseCierre + "la Sra. ";
                }
                fraseCierre = fraseCierre + $scope.asegurado.nmCli + " " + $scope.dataUser.apeCli;
                if (false) {//($scope.poliza.vivienda.selCotizacion.cdClasifPlan == "HIP") {
                    fraseCierre = fraseCierre + ", para la vivienda ubicada en la calle " + $scope.dataUser.domCalle + ", N° " + $scope.datas.domNro + ",";
                } else {
                    fraseCierre = fraseCierre + " con una suma asegurada de hasta $ " + parseFloat($scope.dataUser.sumaAsegurada);
                    fraseCierre = fraseCierre + " de Incendio de Edificio, para la vivienda ubicada en la calle " + $scope.bienAsegurado.direccion + ", N° " + $scope.bienAsegurado.numero + ",";
                }
                fraseCierre = fraseCierre + " con una cuota de $ " + parseFloat($scope.polizaD.mtCuota).toFixed(2);
                fraseCierre = fraseCierre + " a debitarse " + $scope.fraseCierreMedioPago() + ". ";

                if (!$scope.isVerificaDigital) {
                    fraseCierre = fraseCierre + "La cobertura entra en vigencia a partir del " + $rootScope.cotizacion.dataUser.poliza.vigencia + ". ";
                    fraseCierre = fraseCierre + "Habiendo aceptado el seguro, te estaré facilitando el número de tu póliza.";
                    fraseCierre = fraseCierre + "\n\nPodés consultar las condiciones, características, exclusiones y límites de las pólizas ingresando en www.santander.com.ar.";
                    fraseCierre = fraseCierre + "\n\nTe informo, además, que contás con los canales de Online Banking y WEB del banco para ingresar la Solicitud de Baja de tu seguro.";
                }
                fraseCierre = fraseCierre + "\n\n¿Confirmás la operación?";
                //----------------------------------
                //if(confirm(fraseCierre)){
                if ($scope.showConfirmation(fraseCierre) == true) {
                    valFrases = true;
                } else {
                    valFrases = false;
                }

                if (valFrases) {
                    if ($scope.esAceptacionDigital == true) {
                        //sendDigitalVerification();
                    }
                    if ($scope.esEmision == true) {
                        //$scope.emitirPoliza()
                    }
                } else {
                    // $scope.backStep();
                }
            }

        };

        $scope.parse = function (str) {
            if (!/^(\d){8}$/.test(str)) return "invalid date";
            var y = str.substr(0, 4),
                m = str.substr(4, 2),
                d = str.substr(6, 2);
            return new Date(y, m, d);
        }

        $scope.verificar = function (cobertura) {
            $scope.mostrar = false;
            for (var prop in cobertura.coberturas) {
                if ((cobertura.coberturas[prop].mtSumaAsegurada > 0 || cobertura.coberturas[prop].mtSumaAsegurada === "") && cobertura.show) {
                    $scope.mostrar = true;
                }
            }
            return $scope.mostrar;
        }

        $scope.verificarAdicionales = function (coberturas) {
            let mostrar = false;
            angular.forEach(coberturas, function (grupoCoberturas) {
                angular.forEach(grupoCoberturas.coberturas, function (cobertura) {
                    if ((cobertura.mtSumaAsegurada * 1) > 0) {
                        grupoCoberturas.show = true;
                        mostrar = true;
                    }
                })
            });
            return mostrar;
        }

        $scope.verificaDigital = function () {
            gaService.enviarEvento('emision_aceptacion');
            $scope.isVerificaDigital = true;
            $rootScope.aceptacionDigitalRoot = true;
            $scope.esAceptacionDigital = true;
            $scope.esEmision = false;
            $('.loadingSVG').show();
            $('.container-fluid').addClass('loadingFx');
            var cotizacionesParam = [];

            var paramData =
            {
                "msgError": null,
                "ramo": "21",
                "codigoSucursal": $scope.cotiVivienda.cdSuc,
                "numeroCotizacion": $scope.polizaD.nuCotizacion,
                "codigoUsuario": $scope.cotiVivienda.cdUsuario,
                "tipoCuenta": $scope.tpCtaRector, //falta -----------------
                "numeroCuenta": $scope.ctaTarjetaFormato, // falta ---------------
                "fechaInicio": $rootScope.cotizacion.dataUser.poliza.vigencia,
                "numeroNupTomador": $scope.cotiVivienda.nuNup || '',
                "tipoDocTomador": $scope.cotiVivienda.tpDoc,
                "numeroDocTomador": $scope.cotiVivienda.nuDoc,
                "fechaNacTomador": $scope.formattedDate($scope.parse($scope.cotiVivienda.feNac)),
                "codigoProvTomador": $scope.cotiVivienda.cdProvincia,
                "codigoLocalidadTomador": $scope.cotiVivienda.cdLocalidad,
                "codigoPostalTomador": $scope.cotiVivienda.cdPostal,
                "tipoDocAsegurado": $scope.cotiVivienda.tpDoc,
                "numeroDocAsegurado": $scope.cotiVivienda.nuDoc,
                "fechaNacAsegurado": $scope.formattedDate($scope.parse($scope.cotiVivienda.feNac)),
                "nombreBeneficiario1": null,
                "tipoDocBeneficiario1": null,
                "numeroDocBeneficiario1": 0,
                "porcentajeParticipacionBenef1": 0,
                "parentescoBenef1": null,
                "nombreBeneficiario2": null,
                "tipoDocBeneficiario2": null,
                "numeroDocBeneficiario2": 0,
                "porcentajeParticipacionBenef2": 0,
                "parentescoBenef2": null,
                "nombreBeneficiario3": null,
                "tipoDocBeneficiario3": null,
                "numeroDocBeneficiario3": 0,
                "porcentajeParticipacionBenef3": 0,
                "parentescoBenef3": null,
                "nombreBeneficiario4": null,
                "tipoDocBeneficiario4": null,
                "numeroDocBeneficiario4": 0,
                "porcentajeParticipacionBenef4": 0,
                "parentescoBenef4": null,
                "nombreBeneficiario5": null,
                "tipoDocBeneficiario5": null,
                "numeroDocBeneficiario5": 0,
                "porcentajeParticipacionBenef5": 0,
                "parentescoBenef5": null,
                "observaciones": $scope.dataUser.bienAsegurado.alarma || "", //cargar alarma
                "ingresosAsegurado": null,
                "codigoRiesgoAsegurado": null,
                "numeroNupAsegurado": $scope.cotiVivienda.nuNup, //checkear
                "codigoProvAsegurado": $scope.cotiVivienda.cdProvincia,
                "codigoLocalidadAsegurado": $scope.cotiVivienda.cdLocalidad,
                "codigoPostalAsegurado": $scope.cotiVivienda.cdPostal,
                "numeroDjs": 0,
                "frecuenciaDevolucion": null,
                "numeroDePoliza": 0,
                "numeroCertificado": 0,
                "codigoUsuarioConexion": 0,
                "codigoProducto": null,
                "codigoPostalL1": null,
                "codigoPostalL3": null,
                "codigoMarca": null,
                "codigoModelo": null,
                "anioVehiculo": 0,
                "codigoGarage": null,
                "codigoRastreador": null,
                "codigoUsoAuto": null,
                "marcaEmpleado": null,
                "nmSolicitante": null,
                "tipoGnc": null,
                "montoSumaAsegurada": $scope.cotiVivienda.mtSumaAseg,
                "montoSumaGnc": 0,
                "montoSumaRobo": 0,
                "tipoIva": null,
                "tipoCobertura": null,
                "esCeroKm": null,
                "codigoSexo": null,
                "codigoEstadoCivil": null,
                "numeroSec": 0
            }

            cotizacionesParam.push(paramData);

            formEmitServ.setPolizaOld($scope.polizaAceptacionDigital);
            console.log($scope.polizaAceptacionDigital);

            $timeout(function () {

                var promis = issueRepo.sendValidacionesAceptacionDigitalList(cotizacionesParam, null);
                promis.then(function (result) {
                    console.log(result.data.listadoErroresVida);
                    console.log(result.data.listadoErroresAp);
                    console.log(result.data.listadoErroresAuto);
                    console.log(result.data.listadoErroresVivienda);
                    if (!result.data.estadoValido) {
                        $scope.showAdvice("mensaje", result.data.listadoErroresVida, result.data.listadoErroresAp,
                            result.data.listadoErroresAuto, result.data.listadoErroresVivienda, "Vida", "Accidentes Personales", "Auto", "Vivienda");
                    } else {
                        $timeout(function () {

                            if (!result.data.estadoValido) {
                                $scope.showAdvice("mensaje", result.data.listadoErroresVida, result.data.listadoErroresAp,
                                    result.data.listadoErroresAuto, result.data.listadoErroresVivienda, "Vida", "Accidentes Personales", "Auto", "Vivienda");
                            } else {
                                $timeout(function () {
                                    $scope.isVerificaDigital = true;
                                    $scope.fraseCierreVentaPorRamo();

                                });
                            }

                        });
                    }
                    $('.loadingSVG').hide();
                    $('.container-fluid').removeClass('loadingFx');

                }, function () {
                    alert("Ocurrio un problema con el servicio de verificacion.");
                    $('.loadingSVG').hide();
                    $('.container-fluid').removeClass('loadingFx');
                });
            }, 2000);
        };

        $scope.volver = function () {
            $rootScope.menu = menuExperienceServ.updateMenuOption('cliente');
        }

        $scope.showConfirmation = function (params) {
            var params = {
                description: params,
                nameBttOK: 'ACEPTAR',
                nameBttCancel: 'Cancelar'
            }
            $mdDialog.show({
                locals: {
                    infoParams: params,
                },
                controller: 'ctrModalConfirmation',
                templateUrl: './src/new-experience/modal-confirmation/modal-confirmation.html',
                clickOutsideToClose: true
            }).then(function (respOK) {
                console.log('Accion', respOK);
                if ($scope.esAceptacionDigital == true) {
                    sendDigitalVerification();
                }
                if ($scope.esEmision == true) {
                    $scope.emitirPoliza()
                }
                return true
            },
                function (respCancel) {
                    console.log('Accion: ', respCancel);
                    $scope.esAceptacionDigital = false;
                    $scope.esEmision = false;
                    return false
                });
        }

    }];
})();
