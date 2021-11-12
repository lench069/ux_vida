(function () {
    angular.module('quotation', [])
        .directive('quotation', function () {
            return {
                restrict: 'E',
                templateUrl: './src/new-experience/quotation/quotation.html',
                controller: quotationController,
                replace: true
            };
        })
        .service('quotationServ', function () {

        });

    var quotationController = ['$rootScope', '$timeout', '$scope', 'formsRepo', 'issueRepo', '$location', '$mdDialog', '$mdToast', 'menuExperienceServ', 'pricingRepo', '$sce', 'customerServ', 'cotizadorServ', 'formEmitServ', 'gaService', function ($rootScope, $timeout, $scope, formsRepo, issueRepo, $location, $mdDialog, $mdToast, menuExperienceServ, pricingRepo, $sce, customerServ, cotizadorServ, formEmitServ, gaService) {

        console.log('Ingreso contizacion');
        $scope.producto = 'H1234'; // $rootScope.cotizacion.cotiVivienda.firstPricing.cdProducto;
        $scope.numCotizacion = 1234;//$rootScope.cotizacion.cotiVivienda.firstPricing.nuCotizacion;
        $scope.costoTotalMensual = '';
        $scope.costoDiario = '';
        $scope.planDePagos = 12; // $rootScope.cotizacion.cotiVivienda.firstPricing.nuPagos;
        $scope.tamanoM2 = 20; //$rootScope.cotizacion.dataUser.m2;
        $scope.sumaAsegurada = 1234567; //$rootScope.cotizacion.cotiVivienda.firstPricing.sumaAsegurada;
        // $rootScope.cotizacion.dataUser.sumaAsegurada = $rootScope.cotizacion.cotiVivienda.firstPricing.sumaAsegurada;
        $scope.continuarOk = true; // $rootScope.continuarOk ? $rootScope.continuarOk : false;
        $scope.ambiente = 0; // $rootScope.cotizacion.dataUser.ambiente;
        $scope.usuarioEmision = 'Juan Leal'; // $rootScope.cotizacion.cotiVivienda.nmUsuario;
        $scope.sucursalEmision = '1 - ZURICH SANTANDER SEGUROS ARGENTINA'; // $rootScope.cotizacion.cotiVivienda.cdSuc + " - " + $rootScope.cotizacion.cotiVivienda.deSuc;
        $scope.planDisabled = true;

        /* var setCotizacionParams = [
            {
                nuFlota: $scope.cotizacion.cotiVivienda.firstPricing.nuFlota,
                cdSucursal: $scope.cotizacion.cotiVivienda.firstPricing.cdSuc,
                nuCotizacion: $scope.cotizacion.cotiVivienda.firstPricing.nuCotizacion,
                cdRamo: $scope.cotizacion.cotiVivienda.firstPricing.cdRamo,
                deRamo: $scope.cotizacion.cotiVivienda.firstPricing.deRamo,
                cdProducto: $scope.cotizacion.cotiVivienda.firstPricing.cdProducto,
                deProducto: $scope.cotizacion.cotiVivienda.firstPricing.deProducto,
                cdPlan: $scope.cotizacion.cotiVivienda.firstPricing.cdPlan,
                dePlan: $scope.cotizacion.cotiVivienda.dePlan,
                deCompania: $scope.cotizacion.cotiVivienda.firstPricing.deCompania,
                mtPremio: $scope.cotizacion.cotiVivienda.firstPricing.mtPremio,
                mtCuota: $scope.cotizacion.cotiVivienda.firstPricing.mtCuota,
                nuPagos: $scope.cotizacion.cotiVivienda.firstPricing.nuPagos,
                inInspeccion: $scope.cotizacion.cotiVivienda.firstPricing.inInspeccion,
                sumaAsegurada: $scope.cotizacion.cotiVivienda.firstPricing.sumaAsegurada,
                sumaGnc: $scope.cotizacion.cotiVivienda.firstPricing.sumaGnc,
                dePremioPp: $scope.cotizacion.cotiVivienda.firstPricing.dePremioPp,
                costoDsmPP: $scope.cotizacion.cotiVivienda.firstPricing.costoDsmPP,
                deMedidasSeg: $scope.cotizacion.cotiVivienda.firstPricing.deMedidasSeg,
                cdNivelRiesgo: $scope.cotizacion.cotiVivienda.firstPricing.cdNivelRiesgo,
                cdClaseProd: $scope.cotizacion.cotiVivienda.firstPricing.cdClaseProd,
                inDjsProd: $scope.cotizacion.cotiVivienda.firstPricing.in,
                inEmpleProd: $scope.cotizacion.cotiVivienda.firstPricing.inEmpleProd,
                tpCliente: $scope.cotizacion.cotiVivienda.firstPricing.tpCliente,
                cdCategPlan: $scope.cotizacion.cotiVivienda.firstPricing.cdClasePlan,
                cdClasifPlan: $scope.cotizacion.cotiVivienda.firstPricing.cdClasifPlan,
                coberturaVO: $scope.cotizacion.cotiVivienda.firstPricing.coberturaVO
            }
        ]; */

        /* if ($rootScope.cotizacion.cotiVivienda.flagPlan == true) {
            $scope.planDisabled = false;
        } */

        $scope.frecuencias = {
            title: '',
            description: '',
            url: ''
        }

        $scope.promociones = {
            title: '',
            description: '',
            url: ''
        }

        /* var paramsFrecuencias = {
            nu_nup: $rootScope.cotizacion.dataUser.nup ? $rootScope.cotizacion.dataUser.nup : '',
            cd_ramo: $rootScope.cotizacion.ramos,
            cd_suc: $rootScope.cotizacion.dataUserSuc.cdSucursalCapj,
            cd_prod: $rootScope.cotizacion.cotiVivienda.firstPricing.cdProducto,
            cd_plan: $rootScope.cotizacion.cotiVivienda.firstPricing.cdPlan
        } */

        /* pricingRepo.getFrecuencias(function (data) {
            if (data.err_msg == '200 - OK') {
                $scope.frecuencias.title = data.de_titulo;
                $scope.frecuencias.description = data.de_descripcion;
                $scope.frecuencias.url = data.link;
            }

        }, paramsFrecuencias); */

        /* var paramsPromociones = {
            nu_nup: $rootScope.cotizacion.dataUser.nup ? $rootScope.cotizacion.dataUser.nup : '',
            num_doc: $rootScope.cotizacion.dataUser.nuDoc,
            cd_pro: $rootScope.cotizacion.cotiVivienda.firstPricing.cdProducto,
            cd_ramo: $rootScope.cotizacion.ramos,
            cd_canal: $rootScope.cotizacion.dataUserSuc.cdCanal,
            // cd_suc: $rootScope.cotizacion.dataUserSuc.cdSucursalCapj,
            cd_plan: $rootScope.cotizacion.cotiVivienda.firstPricing.cdPlan,
            cd_usuario: $rootScope.cotizacion.dataUserSuc.cdUsuario
        } */

        /* pricingRepo.getPromociones(function (data) {
            if (data.cd_mensaje == '200') {
                $scope.promociones.title = data.de_beneficio;
                $scope.promociones.description = data.de_texto_legal;
                $scope.promociones.url = data.de_link;
            }
        }, paramsPromociones); */

        /* coberturaRequestParams = {
            cdPlan: $rootScope.cotizacion.cotiVivienda.firstPricing.cdPlan,
            cdProducto: $rootScope.cotizacion.cotiVivienda.firstPricing.cdProducto,
            cdRamo: $rootScope.cotizacion.ramos,
            cdSucursal: $rootScope.cotizacion.cotiVivienda.cdSuc,
            sumaAsegurada: $rootScope.cotizacion.dataUser.sumaAsegurada,
            nuCotizacion: $rootScope.cotizacion.cotiVivienda.firstPricing.nuCotizacion
        }

        pricingRepo.doViviendaPersonalizar(function (coberturaResponse) {
            $scope.coberturaVO = coberturaResponse;
            $rootScope.cotizacion.cotiVivienda.coberturasBK = angular.copy(coberturaResponse);
            $scope.costoTotalMensual = $scope.coberturaVO.mtCuota;
            $scope.costoDiario = Math.round(((($scope.costoTotalMensual * 1) / 30) + Number.EPSILON) * 100) / 100;
            $scope.premio = $scope.coberturaVO.mtPremio;
            $rootScope.cotizacion.cotiVivienda.planPersonalizado = {
                'coberturaVO': $scope.coberturaVO,
                'costoTotalMensual': $scope.costoTotalMensual,
                'costoDiario': $scope.costoDiario,
                'premio': $scope.premio,
                'producto': $scope.producto,
                'numCotizacion': $scope.numCotizacion,
                'numDePagos': $scope.planDePagos,
                'tamanoM2': $scope.tamanoM2,
                'sumaAsegurada': $scope.sumaAsegurada,
                'ambiente': $scope.ambiente,
                'usuarioEmision': $scope.usuarioEmision,
                'sucursalEmision': $scope.sucursalEmision,
            }

        }, coberturaRequestParams); */

        var dialogEnriController = ['$scope', '$mdDialog', 'enriUrlEnc',
            function ($scope, $mdDialog, enriUrlEnc) {

                $scope.cancel = function () {
                    $mdDialog.cancel('Cancelando respuesta modal');
                };

                $scope.acept = function () {
                    $mdDialog.hide('Continuar respuesta ok');
                };
                $scope.enriUrlEncuesta = $sce.trustAsResourceUrl(enriUrlEnc);
            }];

        $scope.showEncuestaEnri = function (enriUrlEncuesta) {
            $mdDialog.show({
                locals: {
                    enriUrlEnc: enriUrlEncuesta
                },
                controller: dialogEnriController,
                templateUrl: './src/new-experience/modal-HTML/modal-encuesta-enri.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen
            }).then(function (respOK) {
                console.log(respOK + ', Redireccionando a Cliente');
                // $location.url('/form');
                // $rootScope.refresh = true;
                $scope.setCotizacion(setCotizacionParams);
            }, function (respCancel) {
                console.log(respCancel + ' Encuesta');
            });
        };

        var sendCotizacionErr = function (data) {

            var toast;
            var message = '';
            var el = angular.element(document.getElementsByClassName("barbuttons"));

            if (data.data != undefined) {
                message = data.data.mensaje;
            } else {
                message = data;
            }

            var toastChrome = $mdToast.simple()
                .content(message)
                .highlightAction(true)
                .hideDelay(6000)
                .position('bottom right')
                .parent(el);

            toast = toastChrome;

            $mdToast.show(toast);
        };

        $scope.continuar = function () {
            gaService.enviarEvento("cotizacion_continuar");

            var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;

            var dialogDesicionEnriController = ['$scope', '$mdDialog', 'infoParams', function ($scope, $mdDialog, infoParams) {
                $scope.info = infoParams;
                $scope.cancel = function () { $mdDialog.cancel('Cancelando respuesta modal'); };
                $scope.acept = function () { $mdDialog.hide('Continuar respuesta ok'); };
            }];

            if ($rootScope.cotizacion.dataUser.enri.enriUseService == true) {
                if ($rootScope.cotizacion.dataUser.inCliente == 'CLI') {
                    if ($rootScope.cotizacion.dataUser.cdRiesgoBSR == "") {
                        if ($rootScope.cotizacion.dataUser.enri.enriPermiteContinuar == true) {
                            var params = {
                                title: 'Importante!',
                                description: $rootScope.cotizacion.dataUser.enri.enriMensaje,
                                nameBttOK: 'ACEPTAR',
                                nameBttCancel: 'CANCELAR',
                                nameIcon: 'iconViviendaActive.svg'
                            }

                            $mdDialog.show({
                                locals: {
                                    infoParams: params
                                },
                                controller: dialogDesicionEnriController,
                                templateUrl: './src/new-experience/modal-HTML/modal-legales.html',
                                clickOutsideToClose: true,
                                fullscreen: true
                            }).then(function (respOK) {
                                window.scrollTo({ top: currentScroll, behavior: 'smooth' });
                                $scope.showEncuestaEnri($rootScope.cotizacion.dataUser.enri.enriUrlEncuesta);
                            }, function (respCancel) {
                                window.scrollTo({ top: currentScroll, behavior: 'smooth' });
                            });
                            return;
                        } else {
                            sendCotizacionErr($rootScope.cotizacion.dataUser.enri.enriMensaje);
                            return;
                        }

                    }
                }
            }

            $scope.setCotizacion(setCotizacionParams);
        }

        $scope.personalizar = function () {
            gaService.enviarEvento("cotizacion_personalizar");
            $location.url('/coberturas');
        }

        $scope.volver = function () {
            gaService.enviarEvento("cotizacion_volver");
            $rootScope.menu = menuExperienceServ.updateMenuOption('seguro');
            pricingRepo.doResetCotizaciones(function (data) { }, function () { });
            $rootScope.continuarOk = false;
        }

        $scope.planes = function () {
            gaService.enviarEvento("cotizacion_planes");
            $location.url('/newExperience/planes');
        }

        $scope.setCotizacion = function (setCotizacionParams) {
            var promis = pricingRepo.setCotizacionSelect(setCotizacionParams)
            promis.then(function (result) {
                if (result.status == 200) {
                    message = result.data.mensaje;
                    $mdToast.show({
                        template: '<md-toast class="md-toast" style="position:fixed">' + message + '</md-toast>',
                        hideDelay: 10000,
                        position: 'bottom right'
                    });
                    //Se retiro para que no muestre el toasd en la pantalla info cliente
                    // $mdToast.show($mdToast.simple().textContent(message).hideDelay(10000).position("bottom right"));
                    $rootScope.menu = menuExperienceServ.updateMenuOption('cliente');
                } else {
                    sendCotizacionErr(result);
                }
            });
        }

    }];
})();
