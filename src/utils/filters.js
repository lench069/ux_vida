(function () {
	'use strict';
	angular.module('utils', [])

    .filter('truncateAtChar', function() {
	    return function(input, atChar, itemToReturn) {
			var pieces;
			if (input && atChar){
				pieces = input.split(atChar);
				input = pieces[itemToReturn]? pieces[itemToReturn]: pieces[0];
			}
			return input;
	    };
    })
    .filter('sanitizeHtml', function($sce) {
	    return function(stringHtml) {
			return $sce.trustAsHtml(stringHtml);
	    };
    })
    .filter('formatCurrency', function() {
	    return function(valor) {
			var valorSplit = valor.split('.');
			var enteros = valorSplit[0].replaceAll(',', '.')
			if ((valorSplit[1] * 1) > 0) {
				return (enteros + ',' + valorSplit[1]);
			} else {
				return (enteros);
			}
	    };
    })
	/**
	 * Permite restaurar un input number a empty, mediante el ngRequired asociado
	 * 
	 */
	.directive("rangeReset", function(){
		return {
			restrict: 'A',
			scope: {
				ngModel: '=',
				ngRequired: '='
			},
			link: function(scope, element, attrs, ngModel) {
				scope.$watch(function(){
					return scope.ngRequired;
				}, function(newValue) {
					if (newValue === false){
					    scope.ngModel = "";
				    }
				});
			}
		}
	})
	.directive('showFocus', function($timeout) {
		return function(scope, element, attrs) {
			scope.$watch(attrs.showFocus, function (newValue) { 
				$timeout(function() {
					newValue && element.focus();
				});
			},true);
		};    
	})
})();