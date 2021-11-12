/// <reference path="../node_modules/angular/angular.js" />
/// <reference path="../node_modules/jquery/dist/jquery.js" />

//API base url.. production should be "/api/"
//var api = function(inStr) { return "/api-fake/" + inStr + ".json"; };
var api = function(inStr, reqVer) {
  var suffix = "";
	
	if(!reqVer){
    suffix = "?ver=" + new Date().getTime();
  }
	
  return "api/" + inStr + suffix;
};


(function () {
  angular.module("app", [
    "ngRoute",
    "ngMaterial",
    "headerTop",
    "menuLeft",
    "menuRamos",
    "exclusionesGenerales",
    "customer",
    "gestorCampanas",
    "menuTabs",
    "cotizador",
    "formsRepo",
    "cotizaciones",
    "pricingRepo",
    "commonRepo",
    "cotizacionesDetail",
    "coberturas",
    "formEmit",
    "menuExperience",
    "configureSecure",
    "quotation",
    "infoClient",
    "confirmation",
    "coverages",
    "modalInformation",
    "modalConfirmation",
    "modalInnerHTML",
    "modalInnerHTMLOkCancel",
    "modalError",
    "plans",
    "securityMeasures",
    "utils",
    "issueRepo",
    "polizaResume",
    "polizaResumeNewEx",
    "googleAnalytics"])
    .config(function ($routeProvider) {
      $routeProvider
        .when("/form", { templateUrl: "./src/forms/forms-index.html" })
        .when("/pricing", { templateUrl: "./src/pricing/pricing-index.html" })
        .when("/coberturas", { templateUrl: "./src/new-experience/new-coverages-index.html" })
        .when("/newExperience", { templateUrl: "./src/new-experience/experience-index.html" })
        .when("/pricing/cotidetail/:id", { templateUrl: "./src/pricing/pricing-cotizaciones-detail.html" })
        .when("/issue", {templateUrl: "./src/issue/issue-index.html" })
        .when("/issue/poliResume", {templateUrl: "./src/issue/issue-index-poliza-resume.html" })
        .when("/newExperience/planes", { templateUrl: "./src/new-experience/plans-index.html" })
        .when("/newExperience/resumenPoliza", { templateUrl: "./src/new-experience/index-poliza-resume.html" })
        .otherwise({ redirectTo: "/form" });
    })
    .config(function($mdDateLocaleProvider) {
		  $mdDateLocaleProvider.formatDate = function(date) {
        return date ? moment(date).format('DD/MM/YYYY') : '';
      };
		 $mdDateLocaleProvider.parseDate = function(dateString) {
        var m = moment(dateString, 'DD/MM/YYYY', true);
        return m.isValid() ? m.toDate() : new Date(NaN);
      };
    });
})();


var keepAlive = {
  tickInterval: 60 * 1000, //ms
	start: function(){if(window.keepAlive.timer===undefined){window.keepAlive.timer = setTimeout(window.keepAlive.update, window.keepAlive.tickInterval);}},
	update: function(){$.get('/images/pixel.gif').done(window.keepAlive.done);},
	done: function(){window.keepAlive.timer = setTimeout(window.keepAlive.update, window.keepAlive.tickInterval);}
};
keepAlive.start();