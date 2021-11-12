(function () {
    angular.module('infoClient', [])
        .directive('infoClient', function () {
            return {
                restrict: 'E',
                templateUrl: './src/new-experience/info-client/info-client.html',
                controller: infoClientController,
                replace: true
            };
        })
        .service('infoClientServ', function () {

        });

    //var infoClientController = ['$rootScope', '$timeout', '$scope', 'formsRepo', 'issueRepo', 'menuRamosServ', 'customerServ', 'cotizadorServ', 'formEmitServ', '$location', '$mdDialog', '$mdToast', 'infoClientServ', function ($rootScope, $timeout, $scope, formsRepo, issueRepo, menuRamosServ, customerServ, cotizadorServ, formEmitServ, $location, $mdDialog, $mdToast, infoClientServ) {
    var infoClientController = ['$rootScope', '$timeout', '$scope', 'formsRepo', 'issueRepo', 'menuRamosServ', 'customerServ', 'cotizadorServ', 'formEmitServ', '$location', '$mdDialog', '$mdToast', 'infoClientServ', 'menuExperienceServ', 'gaService', function ($rootScope, $timeout, $scope, formsRepo, issueRepo, menuRamosServ, customerServ, cotizadorServ, formEmitServ, $location, $mdDialog, $mdToast, infoClientServ, menuExperienceServ, gaService) {

        var f = new Date();
        $scope.valCorreo = true;
        $scope.valcallesTomador = true;
        $scope.valcallesBienAsegu = true;
        $scope.valMotivo = true;
        $scope.valTarjeta = true;
        $scope.valDeclaJurada = true;
        $scope.flagAceptar = false;
        $scope.localidadesCodPostales = [];
        $scope.vigencias = [];
        $scope.dataUser = $rootScope.cotizacion.dataUser;
        $scope.cotizacion = $rootScope.cotizacion;
        $scope.esCliente = false;
        $scope.personaExpuestaPoliticamente = false;
        $scope.cuentas = [];
        $scope.listTarjDebAlternativas = [];
        $scope.otrasTarjetas = [];
        $scope.valTelefono == true;
        $scope.valDireccion == true;
        $scope.valDireccionBienAseg == true;
        $scope.formaDePago = {};
        var banSelectTarjeta = false;

        if ($rootScope.cotizacion.dataUser.tomador) {
            $scope.tomador = $rootScope.cotizacion.dataUser.tomador;
        } else {
            $scope.tomador = {
                tipoDocumento: $scope.dataUser.tpDocRector,
                nroDocumento: $scope.dataUser.nuDoc,
                nombre: $scope.dataUser.nmCli,
                apellido: $scope.dataUser.apeCli,
                fecNac: moment($scope.dataUser.feNac, 'YYYYMMDD').toDate(),
                sexo: $scope.dataUser.inSexo,
                cuit: $scope.dataUser.nuCuitCuil,
                estadoCivil: $scope.dataUser.cdEdoCivil,
                ocupacion: $scope.dataUser.cdProfesion,
                lugarNacimiento: $scope.dataUser.cdPaisNacimiento,
                nacionalidad: $scope.dataUser.cdPaisNacionalidad,
                direccionLegal: {
                    provincia: $scope.dataUser.cdProvincia,
                    codigoPostal: $scope.dataUser.cdPostal,
                    direccion: $scope.dataUser.domCalle,
                    numero: $scope.dataUser.domNro,
                    piso: $scope.dataUser.domPiso,
                    departamento: $scope.dataUser.domDepto,
                    entreCalles: ""
                },
                contacto: {
                    telefono: $scope.dataUser.nuTelefono,
                    correoElectronico: $scope.dataUser.diMail,
                    envioElectronico: true
                }
            }
        }

        $scope.costoTotalMensual = $rootScope.cotizacion.cotiVivienda.firstPricing.mtCuota;
        $scope.costoTotal = $scope.cotizacion.cotiVivienda.firstPricing.mtCuota;
        $scope.producto = $scope.cotizacion.cotiVivienda.firstPricing.deProducto + " (" + $scope.cotizacion.cotiVivienda.firstPricing.cdProducto + ")"
        $scope.plan = $scope.cotizacion.cotiVivienda.firstPricing.dePlan + " (" + $scope.cotizacion.cotiVivienda.firstPricing.cdPlan + ")"
        $scope.dataPlan = $scope.cotizacion.cotiVivienda.firstPricing;
        $scope.localidadesCodPostales = [];
        $scope.SucCotizacion = $rootScope.cotizacion.dataUserSuc.cdSucursalCapj + " - " + $rootScope.cotizacion.cotiVivienda.firstPricing.nuCotizacion;
        $scope.planPersonalizado = $rootScope.cotizacion.cotiVivienda.planPersonalizado;

        $scope.showCard = {
            ubicacion: true,
            datos: true,
            vivienda: true
        };

        if ($rootScope.cotizacion.dataUser.vivienda) {
            $scope.vivienda = $rootScope.cotizacion.dataUser.vivienda;
        } else {
            $scope.vivienda = {
                provincia: {},
                codigoPostal: {},
                claseVivienda: {},
                propietarioInquilo: {},
                m2: '',
                ambiente: '',
                piso: {},
                noTamano: false,
                montoAsegurado: 350000000,
                tipoVivienda: 'casa'
            };
        }

        $scope.provincias = customerServ.getProvincias();
        $scope.localidades = customerServ.getLocalidades();

        $scope.poliza = {
            vigencia: ''
        }

        formsRepo.getAllProvincias(function (data) {
            $scope.provincias = data;
            formsRepo.getLocalidadesByProv(function (data) {
                $scope.localidadesCodPostales = data;
                console.log(data);
                $timeout(function () {
                    var locPos = $scope.localidadesCodPostales[0].valor.split('|')
                    $scope.selectedItemChange($scope.dataUser.cdCiudad + '|' + $scope.dataUser.cdPostal + '|' + locPos[2], 'codPos');
                }, 1000);
            }, $scope.dataUser.cdProvincia);
        });

        $scope.selectedItemChange = function (item, attr) {
            if (item != undefined) {
                $scope.dataUser[attr] = item;
                if (attr == 'cdProvincia') {
                    var prov = $scope.provincias.find(function (elemt) { return (elemt.valor == item) });
                    $scope.localidadesCodPostales = [];
                    $scope.dataUser.deProvincia = prov.descripcion;
                    $scope.dataUser.deLocalidad = '';
                    $scope.dataUser.cdPostal = '';
                    $scope.dataUser.codPos = '';
                    formsRepo.getLocalidadesByProv(function (data) {
                        $scope.localidadesCodPostales = data;
                    }, $scope.dataUser[attr]);
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

        if ($rootScope.cotizacion.dataUser.asegurado || ($rootScope.cotizacion.asegurado && $rootScope.cotizacion.asegurado.activo)) {
            if ($rootScope.cotizacion.asegurado && $rootScope.cotizacion.asegurado.activo) {
                asignarAsegurado($rootScope.cotizacion.asegurado);
            } else {
                $scope.asegurado = $rootScope.cotizacion.dataUser.asegurado;
            }
        } else {
            asignarAsegurado($scope.tomador);
        }

        function asignarAsegurado(aseg) {
            $scope.asegurado = {
                sucursalymulticotizacion: "",
                fecInicio: "",
                ocupacion: aseg.ocupacion,
                lugarNacimiento: aseg.lugarNacimiento,
                nacionalidad: aseg.nacionalidad,
                telefono: aseg.telefono,
                correoElectronico: aseg.contacto.correoElectronico,
                correoAlternativo: aseg.contacto.alternativo
            }
        }

        if ($rootScope.cotizacion.dataUser.bienAsegurado) {
            $scope.bienAsegurado = $rootScope.cotizacion.dataUser.bienAsegurado;
        } else {
            $scope.bienAsegurado = {
                provincia: $scope.tomador.direccionLegal.provincia,
                codigoPostal: $scope.tomador.direccionLegal.codigoPostal,
                direccion: $scope.tomador.direccionLegal.direccion,
                numero: $scope.tomador.direccionLegal.numero,
                piso: $scope.tomador.direccionLegal.piso,
                departamento: $scope.tomador.direccionLegal.departamento,
                entreCalles: $scope.tomador.direccionLegal.entreCalles,
                alarma: ""
            }
        }

        if ($rootScope.cotizacion.dataUser.declaracionJurada) {
            $scope.declaracionJurada = $rootScope.cotizacion.dataUser.declaracionJurada;
        } else {
            $scope.declaracionJurada = {
                origenDeFondos: "",
                personaExpuestaPoliticamente: 'false',
                detalleMotivo: "",
                declaro: false
            }
        }

        if ($rootScope.cotizacion.dataUser.formaDePago) {
            banSelectTarjeta = true;
            $scope.formaDePago = $rootScope.cotizacion.dataUser.formaDePago;
            if ($rootScope.cotizacion.dataUser.formaDePago.banco.santander.checked) {
                $scope.cliTar = $scope.formaDePago.banco.santander.listado.ctaTarjetaRector;
                $scope.nocliTar = null;
                $scope.op = 1;
                if ($scope.formaDePago.banco.alternativo.checked && $rootScope.cotizacion.listaDebitosAlternativos && $rootScope.cotizacion.listaDebitosAlternativos.length > 1) {
                    $scope.listTarjDebAlternativas = [];
                    $scope.listTarjDebAlternativas = $rootScope.cotizacion.listaDebitosAlternativos;
                }
            } else if ($rootScope.cotizacion.dataUser.formaDePago.banco.otro.checked) {
                $scope.cliTar = null;
                $scope.nocliTar = $scope.formaDePago.banco.otro.listado.tipo;
                $scope.op = 2;
            }
        } else {
            $scope.formaDePago = {
                banco: {
                    santander: {
                        checked: false,
                        listado: []
                    },
                    otro: {
                        checked: false,
                        listado: [],
                        nro: ""
                    },
                    alternativo: {
                        checked: false,
                        listado: []
                    }
                }
            }
        }

        if (sessionStorage.currentPath != undefined && sessionStorage.currentPath == $location.path() &&
            sessionStorage.user != undefined && document.referrer == "") {

            $scope.cdCanalBco = sessionStorage.cdCanalBco;
            customerServ.setUser(JSON.parse(sessionStorage.user));
        }

        sessionStorage.clear();
        $('.loadingSVG').hide();
        $('.container-fluid').removeClass('loading');

        formsRepo.getAllClaseVivienda(function (data) {
            $scope.clasesViviendas = data;
        });

        formsRepo.getAllSexos(function (data) {
            $scope.sexos = data;
        });
        formsRepo.getAllEstadosCiviles(function (data) {
            $scope.estadosCiviles = data;
        });
        formsRepo.getAllProvincias(function (data) {
            $scope.provincias = data;
        });
        formsRepo.getAllProfesiones(function (data) {
            $scope.profesiones = data;
        });
        formsRepo.getAllDocumentos(function (data) {
            $scope.tpDocs = data;
        });
        formsRepo.getAllParentescos(function (data) { });
        issueRepo.getAllOrigenFondos(function (data) {
            $scope.origenFondos = data;
            $scope.declaracionJurada.origenDeFondos = data[0].valor;
        });
        issueRepo.getTarjetasOtros(function (data) {
            $scope.tarjetasOtros = data;
        });
        issueRepo.getAllPaises(function (data) {
            $scope.paises = data;
        });

        if ($scope.vigencias.length == 0) {
            issueRepo.getVigencia(function (data) {
                $scope.vigencias = data.data;
            }, { cdRamo: $scope.cotizacion.cotiVivienda.cdRamo, nuFlota: $scope.cotizacion.cotiVivienda.nuFlota });
        };

        //TARJETAS

        issueRepo.getMedioPago(function (data) {

            $scope.formaPago = data.data;

            if ($scope.formaPago && $scope.formaPago.OTR && $scope.formaPago.OTR.length > 0) {
                for (i = 0; i < $scope.formaPago.OTR.length; i++) {
                    var tarjeta = $scope.formaPago.OTR[i];
                    let tarj = {
                        descripcion: tarjeta.descripcion,
                        tipo: tarjeta.tipo
                    };
                    $scope.otrasTarjetas.push(tarj);
                };
            }

            if ($scope.dataUser.inCliente == 'CLI' && $scope.formaPago.BCO.length > 0) {

                //Eventos disparados al inciar el controlador
                gaService.enviarEvento("debitos_santander");

                var filtro = [];
                for (i = 0; i < $scope.formaPago.BCO.length; i++) {
                    filtro.push($scope.formaPago.BCO[i].tipo);
                }
                $scope.esCliente = true;
                var valCta = false;
                var requestCuentas = {
                    cdRamo: $scope.cotizacion.cotiVivienda.firstPricing.cdRamo,
                    cdProd: $scope.cotizacion.cotiVivienda.firstPricing.cdProducto
                };

                issueRepo.getAllCuentas(function (data) {
                    $.each(data, function (c, itemc) {
                        var valUnique = false;
                        valCta = filtro.indexOf(itemc.tpCtaRector) > -1;
                        if (valCta) {
                            $.each($scope.cuentas, function (index, cuenta) {
                                if (cuenta.ctaTarjetaRector == itemc.ctaTarjetaRector) {
                                    valUnique = true;
                                }
                            });

                            if (!valUnique && itemc.cdTitularidad != 'AD') {
                                $scope.cuentas.push(itemc);
                                if (!$scope.formaDePago.banco.alternativo.checked) {
                                    $scope.listTarjDebAlternativas.push(itemc);
                                }
                            }
                        }
                    });

                    if ($rootScope.cotizacion.dataUser.formaDePago) {
                        if ($rootScope.cotizacion.dataUser.formaDePago.banco.santander.checked) {
                            $scope.cliTar = $rootScope.cotizacion.dataUser.formaDePago.banco.santander.listado.ctaTarjetaRector;
                            $scope.nocliTar = null;
                            $scope.formaDePago.banco.otro.listado = [];
                            $scope.formaDePago.banco.santander.checked = true;
                            $scope.formaDePago.banco.alternativo.checked = $rootScope.cotizacion.dataUser.formaDePago.banco.alternativo.checked;
                            $scope.formaDePago.banco.otro.checked = false;
                            var numTarj = $scope.formaDePago.banco.alternativo.checked ? $rootScope.cotizacion.dataUser.formaDePago.banco.santander.listado.ctaTarjetaRector : '0000';
                            // restartTarjetasAlter(numTarj, $scope.formaDePago.banco.alternativo.checked);
                            $scope.op = 1;
                        } else if ($rootScope.cotizacion.dataUser.formaDePago.banco.otro.checked) {
                            $scope.cliTar = null;
                            $scope.formaDePago.banco.santander.listado = [];
                            $scope.nocliTar = $rootScope.cotizacion.dataUser.formaDePago.banco.otro.listado.tipo;
                            $scope.formaDePago.banco.santander.checked = false;
                            $scope.formaDePago.banco.otro.checked = true;
                            $scope.formaDePago.banco.alternativo.checked = false;
                            restartTarjetasAlter('0000', false);
                            $scope.op = 2;
                        }
                        if ($rootScope.cotizacion.listaDebitosAlternativos && $rootScope.cotizacion.listaDebitosAlternativos.length > 1) {
                            $scope.listTarjDebAlternativas = [];
                            $scope.listTarjDebAlternativas = $rootScope.cotizacion.listaDebitosAlternativos;
                        }
                    } else {
                        if ($scope.cuentas.length > 0) {
                            $scope.cliTar = $scope.cuentas[0].ctaTarjetaRector;
                            $scope.nocliTar = null;
                            $scope.formaDePago.banco.santander.checked = true;
                            $scope.formaDePago.banco.otro.checked = false;
                        } else {
                            $scope.cliTar = null
                            $scope.nocliTar = $scope.formaPago.OTR[0].tipo;
                            $scope.formaDePago.banco.santander.checked = false;
                            $scope.formaDePago.banco.otro.checked = true;
                        }
                        $scope.formaDePago.banco.alternativo.checked = false;
                        $scope.op = 1;
                    }
                }, requestCuentas);

            } else {
                //Eventos disparados al inciar el controlador
                gaService.enviarEvento('debitos_otroBanco');
                if ($rootScope.cotizacion.dataUser.formaDePago) {
                    if ($rootScope.cotizacion.dataUser.formaDePago.banco.otro.checked) {
                        $scope.nocliTar = $rootScope.cotizacion.dataUser.formaDePago.banco.otro.listado.tipo;
                    } else {
                        $scope.nocliTar = $scope.formaPago.OTR[0].tipo;
                    }

                } else {
                    $scope.nocliTar = $scope.formaPago.OTR[0].tipo;
                }
                $scope.formaDePago.banco.santander.checked = false;
                $scope.formaDePago.banco.otro.checked = true;
                $scope.formaDePago.banco.alternativo.checked = false;
                $scope.op = 2;
            }

        });

        //configureSecure.resetUser();

        window.onbeforeunload = function () {
            sessionStorage.currentPath = $location.path();
            sessionStorage.cdCanalBco = $scope.cdCanalBco;
            sessionStorage.user = JSON.stringify(customerServ.getUser());

        };

        // $scope.dataUser = customerServ.getUser();

        $scope.showHideCard = function (card) {
            console.log($scope.showCard);
            console.log(card);
            if (card == 'u') {
                $scope.showCard.ubicacion = !$scope.showCard.ubicacion;
            }
            if (card == 'd') {
                $scope.showCard.datos = !$scope.showCard.datos;
            }
            if (card == 'v') {
                $scope.showCard.vivienda = !$scope.showCard.vivienda;
            }
        }

        $scope.showDepartamento = function (tipo) {
            $scope.vivienda.tipoVivienda = tipo;
        }

        $scope.checkFormaDePago = function (banco) {

            $scope.op = banco;

            if (banco == 1) {
                gaService.enviarEvento("debitos_santander");
                restartTarjetasAlter('0000', $scope.formaDePago.banco.santander.checked);
                $scope.formaDePago.banco.otro.listado = [];
                $scope.formaDePago.banco.otro.nro = "";
                $scope.formaDePago.banco.otro.checked = false;
                $scope.formaDePago.banco.alternativo.checked = false;
                return;
            }
            if (banco == 2) {
                gaService.enviarEvento('debitos_otroBanco');
                restartTarjetasAlter('0000', false);
                $scope.formaDePago.banco.santander.listado = [];
                $scope.formaDePago.banco.alternativo.listado = [];
                $scope.formaDePago.banco.santander.checked = false;
                $scope.formaDePago.banco.alternativo.checked = false;
                return;
            }
            if (banco == 3) {
                var numTarj = $scope.formaDePago.banco.santander.checked ? $scope.formaDePago.banco.santander.listado.ctaTarjetaRector : '0000';
                restartTarjetasAlter(numTarj, $scope.formaDePago.banco.santander.checked);
                $scope.formaDePago.banco.alternativo.listado = [];
                $scope.formaDePago.banco.otro.checked = false;
                $scope.formaDePago.banco.santander.checked = true;
                return;
            }

        }

        $scope.changeSelectTarjSantander = function () {
            if ($scope.formaDePago.banco.alternativo.checked && !banSelectTarjeta) {
                restartTarjetasAlter($scope.formaDePago.banco.santander.listado.ctaTarjetaRector, true);
            }
            banSelectTarjeta = false;
        }

        function restartTarjetasAlter(numTarjeta, estado) {
            for (i = 0; i < $scope.listTarjDebAlternativas.length; i++) {
                $scope.listTarjDebAlternativas[i].checked = estado;
                if ($scope.listTarjDebAlternativas[i].ctaTarjetaRector == numTarjeta && $scope.formaDePago.banco.santander.checked) {
                    $scope.listTarjDebAlternativas[i].checked = !estado;
                }
            }
        }

        $scope.validar = function () {
            //validaciones
            //fecha de inicio < fecha fin REVISAR
            // if( moment($scope.poliza.desde, 'YYYYMMDD').toDate() >  moment($scope.dataUser.hasta, 'YYYYMMDD').toDate()) return false
            //if( moment($scope.poliza.desde, 'YYYYMMDD').toDate() ==  moment($scope.dataUser.hasta, 'YYYYMMDD').toDate()) return false
            $scope.valCorreo = $scope.tomador.contacto.envioElectronico == false || $scope.tomador.contacto.correoElectronico != undefined && $scope.verificarEmail($scope.tomador.contacto.correoElectronico) && $scope.tomador.contacto.correoElectronico.trim().length > 0;
            //DESCOMENTAR PARA QUE SEA OBLIGATORIO $scope.valcallesTomador = $scope.tomador.direccionLegal.entreCalles != undefined && $scope.tomador.direccionLegal.entreCalles.length > 0;
            //DESCOMENTAR PARA QUE SEA OBLIGATORIO $scope.valcallesBienAsegu = $scope.bienAsegurado.entreCalles != undefined && $scope.bienAsegurado.entreCalles.length > 0;
            $scope.valTelefono = $scope.tomador.contacto.telefono != undefined && $scope.tomador.contacto.telefono.trim().length > 0;
            $scope.valDireccion = $scope.tomador.direccionLegal.direccion != undefined && $scope.tomador.direccionLegal.direccion.trim().length > 0;
            $scope.valDireccionBienAseg = $scope.bienAsegurado.direccion != undefined && $scope.bienAsegurado.direccion.trim().length > 0;
            $scope.valMotivo = $scope.declaracionJurada.personaExpuestaPoliticamente == 'false' || ($scope.declaracionJurada.personaExpuestaPoliticamente == 'true' && $scope.declaracionJurada.detalleMotivo.trim().length > 0);
            $scope.valTarjeta = !$scope.formaDePago.banco.otro.checked || ($scope.formaDePago.banco.otro.checked && $scope.formaDePago.banco.otro.nro && $scope.formaDePago.banco.otro.nro.trim().length == 16);
            $scope.valDeclaJurada = $scope.declaracionJurada.declaro;
            $scope.valSelectTarjetaOtroBanco = $scope.formaDePago.banco.otro.checked == false || ($scope.formaDePago.banco.otro.checked == true && $scope.formaDePago.banco.otro.listado.descripcion != undefined);
            $scope.valSelectTarjetaSantander = $scope.formaDePago.banco.santander.checked == false || ($scope.formaDePago.banco.santander.checked == true && $scope.formaDePago.banco.santander.listado.deTpCtaRector != undefined);

            if ($scope.formaDePago && $scope.formaDePago.banco && ($scope.formaDePago.banco.otro.checked || $scope.formaDePago.banco.santander.checked) &&
                (($scope.formaDePago.banco.otro.listado.descripcion && $scope.formaDePago.banco.otro.nro && $scope.formaDePago.banco.otro.nro.length == 16) || $scope.formaDePago.banco.santander.listado.ctaTarjetaFormato)) {
                return false;
            } else {
                return true;
            }

        }

        $scope.verificarEmail = function (mail) {
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(mail).toLowerCase());
        }

        $scope.validaMailEstilo = function () {
            $scope.mailValido = verificarMail($scope.tomador.contacto.correoElectronico) && $scope.valCorreo;
            if ($scope.dataUser.diMail != $scope.tomador.contacto.correoElectronico && $scope.dataUser.diMail != "" && $scope.dataUser.diMail != null && $scope.valCorreo == true) {
                $scope.showAlert();
            }

        };

        $scope.showAlert = function () {
            // Appending dialog to document.body to cover sidenav in docs app
            // Modal dialogs should fully cover application
            // to prevent interaction outside of dialog
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('ATENCION!')
                    .htmlContent(
                        '<p>El mail ingresado es diferente al que se encuentra en Mensajes y Avisos.</p>' +
                        '<p></p>' +
                        '<ul><b>Mail Ingresado:</b>   ' + $scope.tomador.contacto.correoElectronico + '</ul>' +
                        '<ul><b>Mail Mensajes y avisos:</b>   ' + $scope.dataUser.diMail + '</ul>' +
                        '<p></p>' +
                        '<p></p>' +
                        '<p> <b>*En caso de haber actualizado el mail en "+Che", el mismo puede tardar 24 hrs en reflejarse aquí.</b></p>'
                    )
                    .ok('OK')
            );
        };

        $scope.imprimir = function () {
            gaService.enviarEvento("debitos_imprimir");
            issueRepo.setPrint(function (data) { }, $rootScope.cotizacion.cotiVivienda.firstPricing);
        }

        $scope.aceptar = function () {
            $scope.flagAceptar = true;
        }

        $scope.continuar = function () {
            var listDebAlter = [];
            gaService.enviarEvento("debitos_continuar");
            if ($scope.formaDePago.banco.santander.checked && $scope.formaDePago.banco.alternativo.checked && $scope.listTarjDebAlternativas.length > 1) {
                for (i = 0; i < $scope.listTarjDebAlternativas.length; i++) {
                    if ($scope.listTarjDebAlternativas[i].checked) {
                        listDebAlter.push($scope.listTarjDebAlternativas[i]);
                    }
                }
                $scope.formaDePago.banco.alternativo.listado = listDebAlter;
            }
            if ($scope.mailValido == true && $scope.valMotivo == true && $scope.valTarjeta == true && $scope.valDeclaJurada && $scope.valTelefono == true && $scope.valDireccion == true && $scope.valDireccionBienAseg == true && $scope.valSelectTarjetaOtroBanco == true && $scope.valSelectTarjetaSantander == true) {
                $rootScope.cotizacion.dataUser.formaDePago = $scope.formaDePago;
                $rootScope.cotizacion.dataUser.declaracionJurada = $scope.declaracionJurada;
                $rootScope.cotizacion.dataUser.bienAsegurado = $scope.bienAsegurado;
                $rootScope.cotizacion.dataUser.asegurado = $scope.asegurado;
                $rootScope.cotizacion.dataUser.poliza = $scope.poliza;
                $rootScope.cotizacion.dataUser.vivienda = $scope.vivienda;
                $rootScope.cotizacion.dataUser.tomador = $scope.tomador;
                $rootScope.cotizacion.listaDebitosAlternativos = $scope.listTarjDebAlternativas;
                menuExperienceServ.setMenu('confirmacion');
            } else {
                var params = {
                    title: 'Error',
                    description: 'Los datos ingresados son erroneos o estan incompletos.',
                }
                $scope.showModalValidacion(params);
            }
        }

        $scope.showModalValidacion = function (params) {
            $mdDialog.show({
                locals: {
                    infoParams: params,
                },
                controller: "ctrModalError",
                templateUrl: './src/new-experience/modal-error/modal-error.html',
                clickOutsideToClose: true,
                multiple: true,
            });
        }

        $scope.volver = function () {
            $rootScope.cotizacion.cotiVivienda.flagPlan = true;
            $location.url('/newExperience');
            $rootScope.menu = menuExperienceServ.updateMenuOption('cotizacion');
        }
        $scope.showAnexo = function () {
            // este selector apunta al boton cerrar en el jsp de anexo legal
            var buttonCloseSelector = '#uifDDJJ [type="button"]';
            $('body').delegate(buttonCloseSelector, 'click', function (ev) {
                ev.preventDefault();
                $mdDialog.hide();
            });
            var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
            $mdDialog.show({
                onComplete: function () {
                    //remove inline oncick event
                    $(buttonCloseSelector).prop('onclick', null);
                },
                templateUrl: '/agents/report/instructiveUIF.jsp',
                clickOutsideToClose: true
            }).then(function (respOK) {
                window.scrollTo({ top: currentScroll, behavior: 'smooth' });
            }, function (respCancel) {
                window.scrollTo({ top: currentScroll, behavior: 'smooth' });
            });
        };
    }];
})();