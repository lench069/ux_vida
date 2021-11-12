(function(){
    angular.module('googleAnalytics', [])
    .service('gaService', function(){
    	var ret = function () { };

        // para setear los eventos y las paginas descomentar la parte que esta dentro de los metodos entre /* */.
        // seteo de eventos en GA.
		ret.enviarEvento = function (eventLabel) {
            /* ga('send', {
                hitType: 'event',
                eventCategory: "CTA",
                eventAction: "click",
                eventLabel: eventLabel
            }); */
        };

        // seteo de paginas para GA
        ret.enviarPagina = function (eventPagina) {
            /* ga('send', 'pageview', eventPagina); */
        };
                  
        return ret;
    })
})();