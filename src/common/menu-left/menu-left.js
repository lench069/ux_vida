(function(){
    angular.module('menuLeft', [])
    .directive('menuLeft', function () {
        return {
            restrict: 'E',
            templateUrl: './src/common/menu-left/menu-left.html',
            link: function (scope, element, attr) {
                $('.navbar-brand').on('click', function () {
                    $('#leftbar').toggleClass('short');
                });
            }
        };
    });
})();
