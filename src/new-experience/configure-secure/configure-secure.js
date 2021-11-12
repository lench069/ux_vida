(function () {
    angular.module('configureSecure', [])
        .directive('configureSecure', function () {
            return {
                restrict: 'E',
                templateUrl: './src/new-experience/configure-secure/configure-secure.html',
                controller: configureSecureController,
                replace: true
            };
        })
        .service('configureSecureServ', function () {
            var ret = function () { };
            var user = {};
            var userSuc = {};
            var ramo = '';
            var viviendas = [];
            var provincias = [];;
            var localidades = [];

            ret.setViviendas = function (x) { viviendas = x; };
            ret.getViviendas = function () { return viviendas; };

            ret.setProvincias = function (x) { provincias = x; };
            ret.getProvincias = function () { return provincias; };

            ret.setLocalidades = function (x) { localidades = x; };
            ret.getLocalidades = function () { return localidades; };

            ret.setRamo = function (ramoParams) { ramo = ramoParams; };
            ret.getRamo = function () { return ramo; };

            ret.setUserSuc = function (dataUser) { userSuc = dataUser; };
            ret.getUserSuc = function () { return userSuc; };

            ret.setUser = function (dataUser) { user = dataUser; };
            ret.getUser = function () { return user; };
            ret.resetUser = function () { user = {}; };
            return ret;
        });

    var configureSecureController = ['$rootScope', '$timeout', '$scope', 'formsRepo', 'pricingRepo', 'customerServ', '$location', '$mdDialog', '$mdToast', 'configureSecureServ', 'menuExperienceServ', 'ramosListSharedData', 'gaService', function ($rootScope, $timeout, $scope, formsRepo, pricingRepo, customerServ, $location, $mdDialog, $mdToast, configureSecureServ, menuExperienceServ, ramosListSharedData, gaService) {

        console.log('Configurar seguro');
        $rootScope.cotizacion = {};
        $rootScope.cotizacion.listaSeguros = ['21', '18'];
        $scope.dataUser = {}; // $rootScope.cotizacion.dataUser;
        $scope.dataUserSuc = {}; // $rootScope.cotizacion.dataUserSuc;
        $scope.viviendas = []; // $rootScope.utils.viviendas;
        var cotiViviendaData = {}; // $rootScope.cotizacion;
        var limitsVivienda = {};
        $scope.dataUser.propietarioInquilo = 1; // $scope.dataUser.propietarioInquilo ? $scope.dataUser.propietarioInquilo : 1;
        $scope.selectCobertura = 'CASA'; // !$scope.dataUser.tpCobertura ? 'CASA' : $scope.viviendas.find(function (tipo) { return (tipo.valor == $scope.dataUser.tpCobertura) }).descripcion;
        $scope.selectGrupoFamiliar = '';
        $scope.items = [1, 2, 3, 4, 5, 6, 7];
        $scope.provincias = [];
        $scope.localidades = [];
        $scope.codigosPostales = [];
        $scope.localidadesCodPostales = [];
        $scope.clasesViviendas = [];
        $scope.checked = false;
        $scope.propiedades = [{ valor: 1, descripcion: 'Propietario' }, { valor: 2, descripcion: 'Inquilino' }];
        $scope.ambientes = [];
        $scope.pisos = [{ valor: 1, descripcion: 'Planta baja (Piso cero)' }, { valor: 2, descripcion: 'Uno o superior (+1 piso)' }];
        $scope.showCard = {
            ubicacion: true,
            datos: true,
            vivienda: true,
            asegurado: true
        };

        $scope.alert = {
            title: 'ATENCIÓN!',
            description: ''
        }

        $scope.asegurado = {
            nuDoc: '',
            feNac: '',
            activo: false
        }

        $scope.focus = '';

        $scope.fFocus = function (foco) {
            $scope.focus = foco;
        }

        if ($rootScope.cotizacion.listaSeguros.length > 1) {
            $scope.selectSeguroRamo = 'vida';
        } else if ($rootScope.cotizacion.listaSeguros[0] == '21') {
            $scope.selectSeguroRamo = 'vivienda';
        } else {
            $scope.selectSeguroRamo = 'vida';
        }

        /* if ($rootScope.cotizacion.asegurado && $rootScope.cotizacion.asegurado.activo && $rootScope.cotizacion.asegurado.apeCli) {
            $scope.searchAsegurado = true;
            $scope.asegurado = $rootScope.cotizacion.asegurado;
        } else {
            $scope.searchAsegurado = false;
            $scope.asegurado.activo = false;
        } */

        var dataService = pricingRepo.getCotizacionNormal;

        $scope.ramosSelection = ramosListSharedData.ramosListMap;

        /* formsRepo.getMontoSumaLimitsByRamo(function (data) {
            limitsVivienda = data;
        }, 21); */

        var paramsAlert = {
            vendedor: '', // $scope.dataUserSuc.cdUsuario,
            cd_ramo: 21 // $rootScope.cotizacion.ramos
        }

        /* pricingRepo.getAlertMensaje(function (result) {
            $scope.alert.description = result.mensaje;
        }, paramsAlert); */

        //Eventos disparados al inciar el controlador
        gaService.enviarEvento("datosVivienda_tipo_casa");
        gaService.enviarEvento('datosVivienda_clase');
        gaService.enviarEvento('datosVivienda_propietario');


        $scope.selectTipoVivienda = function (tipoVivienda) {
            switch (tipoVivienda) {
                case 'CASA':
                    gaService.enviarEvento("datosVivienda_tipo_casa");
                    break;
                case 'DEPARTAMENTO':
                    gaService.enviarEvento('datosVivienda_tipo_depto');
                    break;
                case 'COUNTRY / BARRIO CERRADO':
                    gaService.enviarEvento('datosVivienda_tipo_country');
                    break;
                case 'PH':
                    gaService.enviarEvento('datosVivienda_tipo_horizontal');
                    break;
                default:
                    gaService.enviarEvento("datosVivienda_tipo_casa");
                    break;
            }

            $scope.selectCobertura = tipoVivienda;
            if ($scope.viviendas.length > 0) {
                $scope.dataUser.tpCobertura = $scope.viviendas.find(function (tipo) { return (tipo.descripcion == tipoVivienda) }).valor;
            }
            if ($scope.selectCobertura == 'DEPARTAMENTO') {
                $scope.dataUser.piso = '';
            }
        }

        $scope.fSelectGrupoFamiliar = function (grupoFamiliar) {
            $scope.selectGrupoFamiliar = grupoFamiliar;
        }

        $scope.initSelectTipoVivienda = function (tipoVivienda) {
            //$scope.dataUser.tpCobertura = $scope.viviendas.find(function (tipo) { return (tipo.descripcion == tipoVivienda) }).valor;
            if (tipoVivienda == 'DEPARTAMENTO 1ER PISO O +') {
                $scope.selectCobertura = 'DEPARTAMENTO';
            } else {
                $scope.selectCobertura = tipoVivienda;
            }
        }

        $scope.initSelectTipoVivienda($scope.selectCobertura);
        $scope.provincias = customerServ.getProvincias();
        $scope.localidades = customerServ.getLocalidades();

        if (sessionStorage.currentPath != undefined && sessionStorage.currentPath == $location.path()
            && sessionStorage.user != undefined && document.referrer == "") {
            $scope.cdCanalBco = sessionStorage.cdCanalBco;
            customerServ.setUser(JSON.parse(sessionStorage.user));
        }

        sessionStorage.clear();
        $('.loadingSVG').hide();
        $('.container-fluid').removeClass('loading');

        /* formsRepo.getAllClaseVivienda(function (data) {
            $scope.clasesViviendas = data;
            if (!$scope.dataUser.cdClaseRiesgo) {
                $scope.dataUser.cdClaseRiesgo = data[0].valor;
            }
        });
     
        formsRepo.getAllAmbientes(function (data) {
            $scope.ambientes = data.ambientes;
        }, 21); */

        if ($scope.dataUser.ambiente) {
            $scope.checked = true;
        } else {
            $scope.checked = false;
        }

        /* $scope.selectedItemChange = function (item, attr) {
            if (item != undefined) {
                $scope.dataUser[attr] = item;
                if (attr == 'cdProvincia') {
                    var prov = $scope.provincias.find(function (elemt) { return (elemt.valor == item) });
                    $scope.localidadesCodPostales = [];
                    $scope.dataUser.deProvincia = prov.descripcion;
                    $scope.dataUser.deLocalidad = '';
                    $scope.dataUser.cdPostal = '';
                    $scope.dataUser.codPos = '';
                    formsRepo.getLocalidadesByProv(function (data) { $scope.localidadesCodPostales = data; }, $scope.dataUser[attr]);
                }
                if (attr == 'codPos') {
                    var localPos = $scope.localidadesCodPostales.find(function (elemt) { return (elemt.valor.slice(0, -2) == item.slice(0, -2)) });
                    if (!localPos) {
                        var params = { description: '' }
                        modalError(params);
                    }
                    $scope.dataUser[attr] = localPos.valor;
                    var locPos = localPos.valor.split('|');
                    $scope.dataUser.deLocalidad = localPos.descripcion;
                    $scope.dataUser.cdCiudad = locPos[0];
                    $scope.dataUser.cdPostal = locPos[1];
                }
            };
        };
     
        formsRepo.getAllProvincias(function (data) {
            $scope.provincias = data;
            if ($scope.dataUser.cdProvincia != undefined) {
                $scope.searchProv = $scope.dataUser.deProvincia;
                formsRepo.getLocalidadesByProv(function (data) {
                    $scope.localidadesCodPostales = data;
                    if ($scope.dataUser.deLocalidad == undefined) {
                        $scope.searchLocalidad = $scope.dataUser.deCiudad + '(' + $scope.dataUser.cdPostal + ')';
                    } else {
                        $scope.searchLocalidad = $scope.dataUser.deLocalidad;
                    }
                    var locPos = $scope.localidadesCodPostales[0].valor.split('|');
                    $scope.selectedItemChange($scope.dataUser.cdCiudad + '|' + $scope.dataUser.cdPostal + '|' + locPos[2], 'codPos');
                }, $scope.dataUser.cdProvincia);
            }
        }); */

        $scope.querySearch = function querySearch(query, list) {
            var results = query ? $scope[list].filter(function (el) {
                return el.descripcion.toUpperCase().indexOf(query.toUpperCase()) > -1;
            }) : $scope[list], deferred;
            return results;
        };

        window.onbeforeunload = function () {
            sessionStorage.currentPath = $location.path();
            sessionStorage.cdCanalBco = $scope.cdCanalBco;
            sessionStorage.user = JSON.stringify(customerServ.getUser());
        };

        $scope.showHideCard = function (card) {
            $scope.showCard[card] = !$scope.showCard[card];
        }

        $scope.selectedItemChangeCust = function (item, attr) {
            if (item != undefined) {
                $scope.dataUser[attr] = item;
                if (attr == 'cdProvincia') {
                    formsRepo.getLocalByProv(function (data) {
                        $scope.localidades = data;
                        $scope.dataUser.cdCiudad = '';
                        $scope.dataUser.cdPostal = '';
                    }, $scope.dataUser.cdProvincia);
                } else if (attr == 'cdCiudad') {
                    formsRepo.getCodPostalByLocalidad(function (data) {
                        $scope.codigosPostales = data;
                    }, $scope.dataUser.cdProvincia, $scope.dataUser.cdCiudad);
                } else if (attr == 'cdPostal') {
                };
            };
        };

        $scope.checkNoSize = function (checked) {
            if (checked) {
                $scope.dataUser.m2 = '';
            } else {
                $scope.dataUser.ambiente = '';
            }
            $scope.dataUser.sumaAsegurada = 0;
        };

        $scope.continuar = function () {

            var infoRoot = $rootScope.cotizacion;
            var parametros = {
                nup: infoRoot.dataUser.nup,
                suc: infoRoot.dataUserSuc.cdSucursalCapj,
                edo: infoRoot.dataUser.cdProvincia,
                ciudad: infoRoot.dataUser.cdCiudad,
                post: infoRoot.dataUser.cdPostal,
                categ: infoRoot.dataUser.tpCobertura,
                clasif: infoRoot.dataUser.cdClaseRiesgo,
                ramo: infoRoot.ramos
            }

            var medidas = formsRepo.getMedidasDeSeguridad(parametros);

            medidas.then(function (data) {
                var medidasSeguridadText = data.data.data.medidasSeguridad;
                if (!medidasSeguridadText) {

                    var params = {
                        title: 'ERROR',
                        description: 'No pudo resolver las medidas de seguridad para los datos ingresados',
                    }
                    modalError(params);
                } else {

                    $mdDialog.show({
                        locals: {
                            infoParams: medidasSeguridadText,
                        },
                        controller: "securityMeasuresController",
                        templateUrl: './src/new-experience/security-measures/security-measures.html',
                        clickOutsideToClose: true,
                        multiple: false,
                    }).then(function (respOK) {
                        var params = {
                            deProvincia: cotiViviendaData.dataUser.deProvincia,
                            deLocalidad: cotiViviendaData.dataUser.deCiudad + '(' + cotiViviendaData.dataUser.cdPostal + ')',
                            tpCobertura: $scope.dataUser.tpCobertura,
                            cdClaseRiesgo: $scope.dataUser.cdClaseRiesgo,
                            mtSumaAseg: $scope.dataUser.sumaAsegurada,
                            cdProvincia: cotiViviendaData.dataUser.cdProvincia,
                            limits: limitsVivienda,
                            codPos: cotiViviendaData.dataUser.cdCiudad + '|' + cotiViviendaData.dataUser.cdPostal,
                            cdRamo: cotiViviendaData.ramos,
                            cdLocalidad: cotiViviendaData.dataUser.cdCiudad,
                            cdPostal: cotiViviendaData.dataUser.cdPostal,
                            cdActividad: cotiViviendaData.dataUser.cdProfesion,
                            nu_m2: ($scope.dataUser.m2 && $scope.dataUser.m2 != "") ? $scope.dataUser.m2 : null,
                            nu_amb: ($scope.dataUser.ambiente && $scope.dataUser.ambiente != "") ? $scope.dataUser.ambiente : null,
                            condicionHab: ($scope.dataUser.propietarioInquilo == 1) ? 'D' : 'I',
                            pisoDepto: $scope.dataUser.piso
                        };

                        console.log('Accion', respOK);
                        var promis = dataService(params);
                        promis.then(function (result) {
                            result = (typeof result != "object") ? {} : result;
                            result.asyncIsDone = true;
                            $rootScope.cotizacion.cotiVivienda = result;

                            if ($scope.asegurado.activo) {
                                $rootScope.cotizacion.asegurado = $scope.asegurado;
                            }

                            if ($rootScope.cotizacion.cotiVivienda.firstPricing && $rootScope.cotizacion.cotiVivienda.firstPricing != 0) {
                                menuExperienceServ.setMenu('cotizacion');
                            } else {
                                var params = {
                                    title: 'ERROR',
                                    description: $rootScope.cotizacion.cotiVivienda.mensaje,
                                }
                                modalError(params);
                            }
                        });

                    }, function (respCancel) {
                        console.log('Accion: ', respCancel);
                    });
                }
            }, function (data) {
                console.log('Error al obtener el mensaje de Medidas de seguridad: ' + data.data);
            });

            configureSecureServ.setUser($scope.dataUser);
            $rootScope.cotizacion.dataUser = $scope.dataUser;

        }

        function modalError(params) {
            var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
            $mdDialog.show({
                locals: {
                    infoParams: params,
                },
                controller: "ctrModalError",
                templateUrl: './src/new-experience/modal-error/modal-error.html',
                clickOutsideToClose: true,
                multiple: true,
            }).then(function (respOK) {
                window.scrollTo({ top: currentScroll, behavior: 'smooth' });
            }, function (respCancel) {
                window.scrollTo({ top: currentScroll, behavior: 'smooth' });
            });
        }

        $scope.getCotizacionMotoAsegurado = function () {
            var ambiente = $scope.dataUser.ambiente ? $scope.dataUser.ambiente.toString().replace('+', '') : 0;
            gaService.enviarEvento("datosVivienda_continuar");
            formsRepo.getCotizacionMotoAsegurado(
                function (data) {
                    if ((data.sumaAsegurada * 1) > 0) {
                        $scope.dataUser.sumaAsegurada = (data.sumaAsegurada * 1);
                        $scope.continuar();
                    } else {
                        var params = {
                            title: 'ERROR',
                            description: data.msj_error // ' No se pudo resolver la suma asegurada para los datos ingresados ramo=' + $rootScope.cotizacion.ramos + ', Sucursal=' + $scope.dataUserSuc.cdSucursalCapj + ' y Nup=' + $scope.dataUser.nup
                        }
                        modalError(params);
                    }
                },
                $scope.dataUser.cdProvincia,
                $scope.dataUser.cdPostal,
                $scope.dataUser.m2 ? $scope.dataUser.m2 : 0,
                ambiente,
                $scope.dataUser.nup,
                21,
                $scope.dataUserSuc.cdSucursalCapj,
                $scope.dataUser.secCoordinador ? $scope.dataUser.secCoordinador : 'N',
                $scope.dataUser.inEmpleado ? $scope.dataUser.inEmpleado : 0
            );
        };

        $scope.callSeguro = function () {
            if ($scope.dataUser.m2 > 19 || $scope.dataUser.ambiente) {
                // Para llamar al servicio de la suma asegurada cada vez q los datos de metros cuadrados y ambientes sean correctos descomentar la linea siguiente.
                // $scope.getCotizacionMotoAsegurado();
            } else {
                $scope.dataUser.sumaAsegurada = 0;
            }
        }

        $scope.validar = function () {
            if ((($scope.dataUser.m2 * 1) > 19 || $scope.dataUser.ambiente)) {
                if ($scope.asegurado.activo && ($scope.asegurado.nuDoc == '' || $scope.dataUser.deLocalidad == undefined || $scope.dataUser.deLocalidad == '' || $scope.dataUser.deProvincia == undefined || $scope.dataUser.deProvincia == '')) {
                    return true;
                }
                if ($scope.selectCobertura != 'DEPARTAMENTO') {
                    $scope.dataUser.piso = null;
                    return false;
                } else {
                    if (!$scope.dataUser.piso) {
                        return true;
                    }
                    if ($scope.dataUser.piso && $scope.dataUser.piso == 2) {
                        $scope.dataUser.tpCobertura = '5';
                    }
                    if ($scope.dataUser.piso && $scope.dataUser.piso == 1) {
                        $scope.dataUser.tpCobertura = '2';
                    }
                    return false;
                }

            } else {
                return true;
            }
        }

        $scope.volver = function (seguro) {
            $rootScope.volverCotiVivienda = true;
            $rootScope.goEncuestaEnri = false;
            if (seguro == 'regresar' || $rootScope.cotizacion.listaSeguros.length == 1) {
                $location.url('/form');
            } else if (seguro == 'vida') {
                $scope.selectSeguroRamo = seguro;
                $rootScope.menu = menuExperienceServ.updateMenuOption('seguro');
            }
        }

        $scope.buscarAsegurado = function () {
            $scope.searchAsegurado = false;
            var request = { "nuDoc": $scope.asegurado.nuDoc, "feNac": $scope.asegurado.feNac };
            if ($scope.asegurado.feNac != '' && $scope.asegurado.feNac != undefined) {
                var feNac1 = $scope.asegurado.feNac;
                request.feNac = moment(feNac1).format("YYYYMMDD");
            }
            $scope.asegurado = {
                nuDoc: $scope.asegurado.nuDoc,
                feNac: $scope.asegurado.feNac,
                activo: $scope.asegurado.activo
            };
            $scope.dataUser.deProvincia = '';
            $scope.dataUser.deLocalidad = '';
            formsRepo.getDataAsegurado(function (data) {
                $scope.searchAsegurado = true;
                if (data.status == 401) {
                    window.location.href = window.location.origin + "/login.do";
                };

                var message = data.data.mensaje;

                if (message != '') {
                    $mdToast.show($mdToast.simple().textContent(message).hideDelay(6000).position("bottom left"));
                };

                console.log(data.data);
                $scope.asegurado = data.data;
                $scope.asegurado.activo = true;

                if (data.data.inCliente != 'CLI' && (data.data.nup == '0' || data.data.nup == '00000000')) {
                    $scope.asegurado.activarCampos = true;
                } else {
                    $scope.asegurado.activarCampos = false;
                    $scope.asegurado.feNac = moment(data.data.feNac).toDate();
                };
            }, request);
        }

        $scope.activarNuevoAsegurado = function () {
            if (!$scope.asegurado.activo) {
                $scope.asegurado = {};
                $scope.asegurado.nuDoc = '';
                $scope.asegurado.feNac = '';
                $scope.searchAsegurado = false;
            }
        }

        $scope.goDJS = function () {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .title('ATENCION!')
                    .htmlContent(
                        '<p>El mail ingresado es diferente al que se encuentra en Mensajes y Avisos.</p>' +
                        '<p></p>' +
                        '<ul><b>Mail Ingresado:</b>   ' + 'juanpa@mail.com' + '</ul>' +
                        '<ul><b>Mail Mensajes y avisos:</b>   ' + 'hoal mensaje' + '</ul>' +
                        '<p></p>' +
                        '<p></p>' +
                        '<p> <b>*En caso de haber actualizado el mail en "+Che", el mismo puede tardar 24 hrs en reflejarse aquí.</b></p>'
                    )
            );

            /* var params = {
                nameBttOK: 'Continuar',
                nameBttCancel: 'Cancelar',
                description: 'Completa el número de Declaración Jurada de Salud',
                dataInput: '123456',
            }

            var dialogDJSController = ['$scope', '$mdDialog', 'infoParams',
                function ($scope, $mdDialog, infoParams) {
                    $scope.info = infoParams;
                    $scope.cancel = function () {
                        $mdDialog.cancel('Cancelando respuesta modal');
                    };

                    $scope.acept = function () {
                        $mdDialog.hide('Continuar respuesta ok');
                    };

                }];

            $mdDialog.show({
                locals: {
                    infoParams: params,
                },
                controller: dialogDJSController,
                templateUrl: './src/new-experience/modal-HTML/modal-input.html',
                clickOutsideToClose: true,
                multiple: true,
            }).then(function (respOK) {
                console.log(respOK + ' DJS');
            }, function (respCancel) {
                console.log(respCancel + ' DJS');
            }); */
        }

        $scope.selectClassVivienda = function () {
            gaService.enviarEvento('datosVivienda_clase');
        }

        $scope.selectPropieVivienda = function () {
            gaService.enviarEvento('datosVivienda_propietario');
        }

        $scope.clickTamM2 = function () {
            gaService.enviarEvento('datosVivienda_tamanio');
        }

        $scope.clickDesconoTamano = function () {
            gaService.enviarEvento('datosVivienda_desconoceTamanio');
        }

        $scope.selectCantAmbientes = function () {
            gaService.enviarEvento('datosVivienda_cantAmbientes');
        }

        $scope.selectPiso = function () {
            gaService.enviarEvento('datosVivienda_piso');
        }

        $scope.continuarVida = function (seguro) {
            menuExperienceServ.setMenu('seguroVivienda');
            if ($rootScope.cotizacion.listaSeguros[0] == '18') {
                menuExperienceServ.setMenu('cotizacion');
            } else {
                $scope.selectSeguroRamo = seguro;
                menuExperienceServ.setMenu('seguroVivienda');
            }
        }

    }];
})();