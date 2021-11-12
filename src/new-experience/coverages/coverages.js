(function () {
  angular.module('coverages', [])
    .directive('coverages', function () {
      return {
        restrict: 'E',
        templateUrl: './src/new-experience/coverages/coverages.html',
        controller: coveragesController,
        replace: true
      };
    })
    .service('coveragesServ', function () {
      var ret = function () { };

      var incluidasAdicionalesIcons = [
        { code: '001', name: 'iconIncendioEdificio.svg', descrip_taggeo_ver: 'persSeguro_detalle_edificio' },
        { code: '006', name: 'IncendioContenido.svg', descrip_taggeo_ver: 'persSeguro_detalle_contenido' },
        { code: '016', name: 'iconRemocionEscombros.svg', descrip_taggeo_ver: 'persSeguro_detalle_escombros' },
        { code: '017', name: 'iconHospedaje.svg', descrip_taggeo_ver: 'persSeguro_detalle_hospedaje' },
        { code: '023', name: 'DaniosEdificioRoboA.svg' },
        { code: '025', name: 'DaniosEdificioRoboB.svg' },
        { code: '026', name: 'iconRoboVacaciones.svg' },
        { code: '114', name: 'iconResponsabilidadCivilRojo.svg' },
        { code: '36', name: 'iconPerdidaAlimentos.svg' },
        { code: '038', name: 'iconGastosVeterinarios.svg', descrip_taggeo_ver: 'adicionales_mascota_veterinarios' },
        { code: '037', name: 'iconFallecimiento.svg', descrip_taggeo_ver: 'adicionales_mascota_fallecimiento' },
        { code: 'xxx', name: 'iconBanio.svg' },
        { code: '154', name: 'NotebookRoboHurto.svg' },
        { code: '155', name: 'NotebookTodoRiesgo.svg' },
        { code: '156', name: 'EquiposdeFotografiaRoboHurto.svg' },
        { code: '157', name: 'EquiposdeFotografiaTodoRiesgo.svg' },
        { code: '024', name: 'iconCristales.svg', descrip_taggeo_ver: 'adicionales_cristales_detalles' },
        { code: '153', name: 'iconTodoRiesgo.svg', descrip_taggeo_ver: 'adicionales_cristales_detalles' },
        { code: '158', name: 'iconJoyas.svg', descrip_taggeo_ver: 'adicionales_joyas_detalles' },
      ];

      var asistenciasIcon = [
        { code: '1', name: 'iconAsistencia24.svg', descrip_taggeo_asis: 'persSeguro_detalle_urgencias' },
        { code: '2', name: 'iconAsistenciaSoporte.svg', descrip_taggeo_asis: 'persSeguro_detalle_cuidadoHogar' },
        { code: '3', name: 'iconAsistenciaAmbulancia.svg', descrip_taggeo_asis: 'persSeguro_detalle_ambulancia' },
        { code: '4', name: 'iconAsistenciaTelefono.svg', descrip_taggeo_asis: 'persSeguro_detalle_telemedicina' },
      ];

      var grupoIcon = [
        { code: 'G1', name: 'iconCoberturaIncendioRojo.svg', descrip_taggeo: 'persSeguro_incendio' },
        { code: 'G2', name: 'iconRoboRojo.svg', descrip_taggeo: 'persSeguro_vivienda' },
        { code: 'G3', name: 'iconResponsabilidadCivilRojo.svg', descrip_taggeo: 'persSeguro_otros' },
        { code: 'G4', name: 'iconNotebookRojo.svg', descrip_taggeo: 'adicionales_notebook' },
        { code: 'G5', name: 'iconFotografiaRojo.svg', descrip_taggeo: 'adicionales_fotografia' },
        { code: 'G6', name: 'btnMasRojo.svg' },
      ];

      ret.searchIncluidasAdicionalesIcon = function (code) {
        var icon = incluidasAdicionalesIcons.find(function (elemt) { return (elemt.code == code) });
        return (icon ? icon : { code: '000', name: 'noIcon' });
      };

      ret.searchAsistenciasIcon = function (code) {
        var icon = asistenciasIcon.find(function (elemt) { return (elemt.code == code) });
        return (icon ? icon : { code: '000', name: 'noIcon' });
      };

      ret.searchGruposIcon = function (code) {
        var icon = grupoIcon.find(function (elemt) { return (elemt.code == code) });
        return (icon ? icon : { code: '000', name: 'noIcon' });
      };

      return ret;
    });

  var coveragesController = ['$rootScope', '$timeout', '$scope', 'formsRepo', 'issueRepo', 'menuRamosServ', '$location', '$mdDialog', '$mdToast', 'coveragesServ', 'pricingRepo', 'gaService', function ($rootScope, $timeout, $scope, formsRepo, issueRepo, menuRamosServ, $location, $mdDialog, $mdToast, coveragesServ, pricingRepo, gaService) {

    $scope.coberturas = {};
    $scope.asistencias = [];
    $scope.showIncAdi = true;
    var cotizacion = $rootScope.cotizacion;
    $scope.costoTotal = cotizacion.cotiVivienda.firstPricing.mtCuota;
    $scope.premio = cotizacion.cotiVivienda.firstPricing.mtPremio;
    $scope.numPagos = cotizacion.cotiVivienda.firstPricing.nuPagos;

    coberturaRequestParams = {
      cdPlan: cotizacion.cotiVivienda.firstPricing.cdPlan,
      cdProducto: cotizacion.cotiVivienda.firstPricing.cdProducto,
      cdRamo: $rootScope.cotizacion.ramos,
      cdSucursal: cotizacion.cotiVivienda.cdSuc,
      sumaAsegurada: cotizacion.dataUser.sumaAsegurada,
      nuCotizacion: cotizacion.cotiVivienda.firstPricing.nuCotizacion
    }

    pricingRepo.doViviendaPersonalizar(function (coberturaResponse) {
      $scope.coberturaVO = coberturaResponse;
      $scope.costoTotal = $scope.coberturaVO.mtCuota;
      $scope.premio = $scope.coberturaVO.mtPremio;

      const requestCober = { cd_ramo: coberturaRequestParams.cdRamo, cd_prod: coberturaRequestParams.cdProducto, cd_plan: coberturaRequestParams.cdPlan };

      pricingRepo.getGroupCoberturas(function (grupoCobertura) {
        $scope.coberturas = grupoCobertura.coberturas;
        asignarDatos($scope.coberturas.obligatorias, coberturaResponse.detalleCobertura, 'incl');
        asignarDatos($scope.coberturas.opcionales, coberturaResponse.detalleCoberturaOpcionales, 'adi');

        pricingRepo.getMascota(function (mascotaResponce) {
          $scope.gruposMascotas = mascotaResponce.data.opcionales;

          angular.forEach($scope.coberturas.opcionales, function (grupoCobertura) {
            angular.forEach(grupoCobertura.coberturas, function (cobertura) {
              angular.forEach($scope.gruposMascotas, function (grupoMascota) {
                const cobert = grupoMascota.coberturas.find(function (element) { return (element.CD_COBERT == cobertura.CD_COBERT) });
                if (cobert) {
                  grupoCobertura.show = ((cobertura.mtSumaAsegurada * 1) > 0) ? true : false;
                  grupoCobertura.active = true;
                  angular.forEach(grupoMascota.coberturas, function (mascota) {
                    var mascot = {};
                    var i = 0;
                    mascot.nameIcon = 'iconBanio.svg';
                    mascot.cdCobertura = mascota.CD_COBERT + i;
                    mascot.deCobertura = mascota.DESC_ASIST;
                    mascot.deCoberturaLarga = mascota.DESC_ASIST_LR;
                    mascot.mtSumaAsegurada = '';
                    mascot.mtSumaMaxima = '';
                    mascot.mtSumaMinima = ''
                    mascot.mtSumaSugerida = '';
                    grupoCobertura.coberturas.push(mascot);
                    i++;
                  });
                }
              });
            });
          });

        }, requestCober);

      }, requestCober);

      pricingRepo.getAsistencias(function (asistenciasResponce) {
        $scope.asistencias = asistenciasResponce.data.lista_asistencias;
        asigIconAsistencias();
      }, requestCober);

    }, coberturaRequestParams);

    function asignarDatos(listagrupo, listaCobertura, tipo) {
      var i = tipo == 'incl' ? 1 : 3;
      angular.forEach(listagrupo, function (grupoCobertura) {
        grupoCobertura.idGrupo = 'G' + i;
        grupoCobertura.nameIcon = coveragesServ.searchGruposIcon('G' + i++).name;
        angular.forEach(grupoCobertura.coberturas, function (cobertura) {
          const cobert = listaCobertura.find(function (element) { return (element.cdCobertura == cobertura.CD_COBERT) });
          if (cobert) {
            if (tipo == 'adi') {
              cobertura.active = ((cobert.mtSumaAsegurada * 1) > 0) ? true : false;
            }
            cobertura.nameIcon = coveragesServ.searchIncluidasAdicionalesIcon(cobert.cdCobertura).name;
            cobertura.cdCobertura = cobert.cdCobertura;
            cobertura.deCobertura = cobertura.DESC_COBERT;
            cobertura.deCoberturaLarga = cobertura.DESC_COBERT_LR;
            cobertura.mtSumaAsegurada = cobert.mtSumaAsegurada;
            cobertura.mtSumaMaxima = cobert.mtSumaMaxima;
            cobertura.mtSumaMinima = cobert.mtSumaMinima;
            cobertura.mtSumaSugerida = cobert.mtSumaSugerida;
          }
        })
      });
    }

    function asigIconAsistencias() {
      for (let i = 0; i < $scope.asistencias.length; i++) {
        let asist = $scope.asistencias[i];
        asist.nameIcon = coveragesServ.searchAsistenciasIcon(asist.cd_asistencia).name;
      }
    }

    $scope.showHide = function (params) {
      console.log(params);
      if (params.idGrupo != undefined) {
        gaService.enviarEvento(coveragesServ.searchGruposIcon(params.idGrupo).descrip_taggeo);
      } else if (params.cdCobertura != undefined) {
        gaService.enviarEvento(coveragesServ.searchIncluidasAdicionalesIcon(params.cdCobertura).descrip_taggeo_ver);
      } else if (params.cd_asistencia != undefined) {
        gaService.enviarEvento(coveragesServ.searchAsistenciasIcon(params.cd_asistencia).descrip_taggeo_asis);
      }

      params.show = !params.show;
    }

    $scope.contraerCoberturas = function (allCoberturas) {
      angular.forEach(allCoberturas, function (coberturas) {
        angular.forEach(coberturas, function (cobertura) {
          angular.forEach(cobertura.coberturas, function (detalleCoberturas) {
            detalleCoberturas.show = false;
          })
        })
      });
    }

    $scope.cotraerAsistencias = function (asistencias) {
      angular.forEach(asistencias, function (asistencia) {
        asistencia.show = false;
      });
    };

    $scope.continuar = function () {
      if ($scope.showIncAdi) {
        gaService.enviarEvento('persSeguro_btnContinuar');
        $scope.showIncAdi = false;
      } else {
        gaService.enviarEvento('adicionales_continuar');
        console.log('Ir contizacion.');
        $scope.contraerCoberturas($scope.coberturas);
        $scope.cotraerAsistencias($scope.asistencias);
        $rootScope.cotizacion.cotiVivienda.coberturas = $scope.coberturas;
        $rootScope.cotizacion.cotiVivienda.asistencias = $scope.asistencias;
        $rootScope.continuarOk = true;
        $location.url('/newExperience');
      }
    }

    $scope.opcionMenu = function () {
      $scope.showIncAdi = true;
    }

    $scope.volver = function () {
      gaService.enviarEvento('adicionales_btnCancelar');
      $scope.showIncAdi = true;
    }

    $scope.cancelar = function () {
      gaService.enviarEvento('persSeguro_btnCancelar');
      console.log('Regreso Cancelado.');
      var params = {
        description: '¿Seguro que quieres cancelar? Si continuas no se aplicarán los cambios en la personalización de la cobertura.',
        nameBttOK: 'SÍ, QUIERO CANCELAR Y VOLVER',
        nameBttCancel: 'No, continuar personalizando'
      }
      $mdDialog.show({
        locals: {
          infoParams: params,
        },
        controller: 'ctrModalInfo',
        templateUrl: './src/new-experience/modal-info/modal-info.html',
        clickOutsideToClose: true
      }).then(function (respOK) {
        console.log('Accion', respOK);
        $rootScope.continuarOk = false;
        pricingRepo.doViviendaPersonalizar2(function (coberturaResponse) {
          $scope.costoTotal = coberturaResponse.mtCuota;
          $scope.premio = coberturaResponse.mtPremio;
          $location.url('/newExperience');
        }, $rootScope.cotizacion.cotiVivienda.coberturasBK);
      }, function (respCancel) {
        console.log('Accion: ', respCancel);
      });
    }

    $scope.activeMonto = function (cobert) {
      if (cobert.active) {
        cobert.mtSumaAsegurada = cobert.mtSumaSugerida;
      } else {
        cobert.mtSumaAsegurada = 0;
      }
      $scope.recalcular();
    }

    $scope.activeMascota = function (grupoCobert) {
      gaService.enviarEvento('adicionales_mascota');
      if (grupoCobert.show) {
        var params = {
          title: grupoCobert.name,
          description: 'Es condición de esta cobertura:<br><ul><li>La mascota debe tener entre 1 y 10 años para poder contratar esta cobertura.</li><li>Esta cobertura aplica para perro o gato y los mismos no pueden ser usados para exposición y/o reproduccion.</li><li>Te cubre una única mascota por vigencia de póliza y no debe tener alguna enfermedad preexistente.</li><ul>',
          nameBttOK: 'ACEPTAR',
          nameBttCancel: 'CANCELAR',
          nameIcon: 'iconProteccionMascotasBlanco.svg'
        }
        var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
        $mdDialog.show({
          locals: {
            infoParams: params,
          },
          controller: 'ctrModalInnerHTMLOkCancel',
          templateUrl: './src/new-experience/modal-innerHTML-ok-cancel/modal-innerHTML-ok-cancel.html',
          clickOutsideToClose: true
        }).then(function (respOK) {
          asignarDatosMascota(grupoCobert);
          window.scrollTo({ top: currentScroll, behavior: 'smooth' });
        }, function (respCancel) {
          grupoCobert.show = false;
          asignarDatosMascota(grupoCobert);
          window.scrollTo({ top: currentScroll, behavior: 'smooth' });
        });
      } else {
        asignarDatosMascota(grupoCobert);
      }
    }

    function asignarDatosMascota(grupoCobert) {
      for (let i = 0; i < grupoCobert.coberturas.length; i++) {
        let cobertura = grupoCobert.coberturas[i];
        cobertura.active = grupoCobert.show;
        if (grupoCobert.show && cobertura.mtSumaMaxima && cobertura.mtSumaMinima && cobertura.mtSumaSugerida) {
          cobertura.mtSumaAsegurada = cobertura.mtSumaSugerida;
        } else {
          if (cobertura.mtSumaMaxima && cobertura.mtSumaMinima && cobertura.mtSumaSugerida) {
            cobertura.mtSumaAsegurada = 0;
          }
        }
      }
      $scope.recalcular();
    }

    function recorrerCoberturasGrupal(listagrupo, listaCoberturas, tipoPlan) {
      angular.forEach(listagrupo, function (grupoCobertura) {
        var retorno = false;
        angular.forEach(grupoCobertura.coberturas, function (cobertura) {
          const cobert = listaCoberturas.find(function (element) { return (element.cdCobertura == cobertura.CD_COBERT) });
          if (cobert) {
            if (tipoPlan == 'incl') {
              cobert.mtSumaAsegurada = cobertura.mtSumaAsegurada;
            }
            if (tipoPlan == 'op' && cobertura.active) {
              cobert.mtSumaAsegurada = cobertura.mtSumaAsegurada;
            }
            if (tipoPlan == 'op' && !cobertura.active) {
              cobert.mtSumaAsegurada = 0;
            }
          }
        });
        if (retorno) {
          return;
        }
      });
    }

    $scope.recalcular = function () {
      if ($scope.showIncAdi) {
        recorrerCoberturasGrupal($scope.coberturas.obligatorias, $scope.coberturaVO.detalleCobertura, 'incl');
      } else {
        recorrerCoberturasGrupal($scope.coberturas.opcionales, $scope.coberturaVO.detalleCoberturaOpcionales, 'op');
      };

      pricingRepo.doViviendaPersonalizar2(function (coberturaResponse) {
        $scope.costoTotal = coberturaResponse.mtCuota;
        $scope.premio = coberturaResponse.mtPremio;
      }, $scope.coberturaVO);
    };

    $scope.suma = function (cobert) {
      cobert.mtSumaAsegurada = (cobert.mtSumaAsegurada * 1) + 500;
      if (cobert.mtSumaAsegurada > cobert.mtSumaMaxima) {
        cobert.mtSumaAsegurada = cobert.mtSumaMaxima;
        // $mdToast.show($mdToast.simple().textContent("Límites superior.").position("bottom left"));
      }
      $scope.recalcular();
    }

    $scope.resta = function (cobert) {
      cobert.mtSumaAsegurada = (cobert.mtSumaAsegurada * 1) - 500;
      if (cobert.mtSumaAsegurada < cobert.mtSumaMinima) {
        cobert.mtSumaAsegurada = cobert.mtSumaMinima;
        // $mdToast.show($mdToast.simple().textContent("Límites inferior.").position("bottom left"));
      }
      $scope.recalcular();
    }

    function showModalInnerHTML(params) {

      var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;

      $mdDialog.show({
        locals: {
          infoParams: params,
        },
        controller: "ctrModalInnerHTML",
        templateUrl: './src/new-experience/modal-innerHTML/modal-innerHTML.html',
        clickOutsideToClose: true,
        multiple: false,
      }).then(function (respOK) {
        window.scrollTo({ top: currentScroll, behavior: 'smooth' });
      }, function (respCancel) {
        window.scrollTo({ top: currentScroll, behavior: 'smooth' });
      });

    }

    $scope.showModalAsistencia = function (asistencia) {

      var params = {
        title: asistencia.desc,
        description: asistencia.desc_larga,
        nameIcon: 'iconViviendaActive.svg'
      }

      showModalInnerHTML(params);

    }

    $scope.showExcluciones = function () {
      gaService.enviarEvento('persSeguro_detalle_exclusiones');
      const requestCober = { cd_ramo: coberturaRequestParams.cdRamo, cd_prod: coberturaRequestParams.cdProducto, cd_plan: coberturaRequestParams.cdPlan };
      pricingRepo.getExcluciones(function (excluResponce) {
        var params = {
          title: 'Exclusiones',
          description: excluResponce.data,
          nameIcon: 'iconViviendaActive.svg',
        }
        showModalInnerHTML(params);
      }, requestCober);
    }

    $scope.presionar = function (cobert, operacion) {
      timeStart = new Date(); // permite obtener el tiempo de inicio en que se preciono el click.
      $scope.ban = true;
      $scope.incremento = setInterval(function () {
        timeEnd = new Date();
        $scope.timeDiff = (timeEnd - timeStart) / 1000;
        if (cobert.mtSumaAsegurada.toString().indexOf('.') >= 0) {
          var valorSplit = cobert.mtSumaAsegurada.toString().split('.');
          cobert.mtSumaAsegurada = valorSplit[0];
        }
        if (operacion == 'suma') {
          if ($scope.timeDiff >= 4) {
            cobert.mtSumaAsegurada = (cobert.mtSumaAsegurada * 1) + 30000;
          } else {
            cobert.mtSumaAsegurada = (cobert.mtSumaAsegurada * 1) + 500;
          }
          // cobert.mtSumaAsegurada = (cobert.mtSumaAsegurada * 1) + 500;
          if (cobert.mtSumaAsegurada > (cobert.mtSumaMaxima * 1)) {
            cobert.mtSumaAsegurada = cobert.mtSumaMaxima;
          }
        } else {
          if ($scope.timeDiff >= 4) {
            cobert.mtSumaAsegurada = (cobert.mtSumaAsegurada * 1) - 30000;
          } else {
            cobert.mtSumaAsegurada = (cobert.mtSumaAsegurada * 1) - 500;
          }
          // cobert.mtSumaAsegurada = (cobert.mtSumaAsegurada * 1) - 500;
          if (cobert.mtSumaAsegurada < (cobert.mtSumaMinima * 1)) {
            cobert.mtSumaAsegurada = cobert.mtSumaMinima;
          }
        }
        var inputCobert = document.getElementById(cobert.CD_COBERT);
        inputCobert.value = '$' + FormatCurrency(cobert.mtSumaAsegurada);
      }, 50);
    }

    $scope.soltar = function () {
      if ($scope.ban) {
        clearInterval($scope.incremento);
        $scope.recalcular();
      }
      $scope.ban = false;
    }

    $scope.cantMinima = function (cobert) {
      // Descomentar las dos lineas siguiente si se desea ir a la cantidad minima al dar doble click.
      // cobert.mtSumaAsegurada = cobert.mtSumaMinima;
      // $scope.recalcular();
    }

    $scope.cantMaxima = function (cobert) {
      cobert.mtSumaAsegurada = cobert.mtSumaMaxima;
      $scope.recalcular();
    }

  }];

})();