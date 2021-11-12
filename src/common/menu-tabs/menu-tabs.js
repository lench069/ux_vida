(function(){
    angular.module('menuTabs', [])
    .directive('menuTabs', function(){
        return {
            restrict: 'E',
            templateUrl: './src/common/menu-tabs/menu-tabs.html'
        };
    });
})();