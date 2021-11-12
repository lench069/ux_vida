(function () {
    angular.module('menuExperience', [])
        .directive('menuExperience', function () {
            return {
                restrict: 'E',
                templateUrl: './src/new-experience/menu-experience/menu-experience.html',
                controller: menuExperienceController,
                replace: true
            };
        })
        .service('menuExperienceServ', function () {

            var ret = function () { };
            menu = {
                seguro: true,
                seguroVivienda: true,
                cotizacion: true,
                cliente: false,
                confirmacion: false
            };

            ret.setMenu = function (attr) { menu[attr] = true; };
            ret.getMenu = function () { return menu; };
            ret.updateMenuOption = function (attr) {
                if (attr == 'seguro') {
                    menu = {
                        seguro: true,
                        seguroVivienda: true,
                        cotizacion: true,
                        cliente: false,
                        confirmacion: false
                    };
                }
                if (attr == 'seguroVivienda') {
                    menu = {
                        seguro: true,
                        seguroVivienda: true,
                        cotizacion: true,
                        cliente: false,
                        confirmacion: false
                    };
                }
                if (attr == 'cotizacion') {
                    menu = {
                        seguro: true,
                        seguroVivienda: true,
                        cotizacion: true,
                        cliente: false,
                        confirmacion: false
                    };
                }
                if (attr == 'cliente') {
                    menu = {
                        seguro: true,
                        seguroVivienda: true,
                        cotizacion: true,
                        cliente: true,
                        confirmacion: false
                    };
                }
                if (attr == 'confirmacion') {
                    menu = {
                        seguro: true,
                        seguroVivienda: true,
                        cotizacion: true,
                        cliente: true,
                        confirmacion: true
                    };
                }
                return menu;
            };

            return ret;

        });

    var menuExperienceController = ['$rootScope', '$timeout', '$scope', 'formsRepo', 'issueRepo', 'menuRamosServ', 'customerServ', 'cotizadorServ', 'formEmitServ', '$location', '$mdDialog', '$mdToast', 'menuExperienceServ', function ($rootScope, $timeout, $scope, formsRepo, issueRepo, menuRamosServ, customerServ, cotizadorServ, formEmitServ, $location, $mdDialog, $mdToast, menuExperienceServ) {

        $rootScope.menu = menuExperienceServ.getMenu();
        $scope.habilitaMenu = function (opcion) {
            $rootScope.menu = menuExperienceServ.updateMenuOption(opcion);
        };

    }];
})();