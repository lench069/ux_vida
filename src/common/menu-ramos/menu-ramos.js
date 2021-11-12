(function(){
    angular.module('menuRamos', [])

    .controller('MenuRamosController',['formsRepo', '$scope', 'ramosProperties', '$rootScope', 'ramosListSharedData', 'menuRamosServ', function(formsRepo, $scope, ramosProperties, $rootScope, ramosListSharedData, menuRamosServ){
        
    	$scope.viviendaSelected = false;
		$scope.ramosList = menuRamosServ.getRamos();
		
		$scope.$watch(function() {
            return menuRamosServ.getRamos();
        }, function(newList) {
            $scope.ramosList = newList;
        });

        $scope.toggleSelected = function(ramo) {
            var ramos = $scope.ramosList;
            //No es multi, apago todos excepto clicked item
            if (!ramo.isMulti){
                //off all
                angular.forEach(ramos, function (currentItem) {
                    if (currentItem.cdRamo!= ramo.cdRamo){
                        currentItem.selected = false;
                    }
                });
            }else {
                //Es multi, apago los noMulti selected
                var singleSelected = ramos.filter(function(item){
                    return !item.isMulti && item.selected;
                });
                angular.forEach(singleSelected, function (currentItem) {
                    if (currentItem.cdRamo!= ramo.cdRamo){
                        currentItem.selected = false;
                    }
                });
            }
            ramo.selected = !ramo.selected;
        };
    }])


    .directive('menuRamos', function(){
        return {
            restrict: 'E',
            templateUrl: './src/common/menu-ramos/menu-ramos.html'
            };
    })

    
    .directive('toggleClass', [ 'ramosProperties', "$rootScope", function(ramosProperties, $rootScope) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('click', function() {

                    element.toggleClass(attrs.toggleClass);
                });
            }
        };
    }])


    .directive('ramosSwitcher', ["$rootScope", "ramosSelection", function($rootScope, ramosSelection) {
        var currentRamoIsMulti = true;
        var currentRamoCode;
        return {
            restrict: 'A',
            scope: {
                ramo: '='
            },
            link: function(scope, element, attrs) {
                element.bind('click', function() {

                    currentRamoCode = scope.ramo.cdRamo;
                    currentRamoIsMulti = scope.ramo.isMulti;
                    $rootScope.$broadcast('switchRamoIsMulti');

                    //scope.ramoSelected = (scope.ramoSelected == "true")? "false": "true";
                    scope.ramo.selected = !scope.ramo.selected;
                    ramosSelection.setRamosItemEnabled(scope.ramo);
                    scope.$apply();
                });
                $rootScope.$on('switchRamoIsMulti', function() {
                    if (scope.ramo.cdRamo != currentRamoCode){
                        //An element with isMulti(true) was just clicked
                        if ( currentRamoIsMulti && !(scope.ramo.isMulti)){
                            scope.ramo.selected = false;
                            scope.$apply();
                        }
                        //An element with isMulti(false) was just clicked
                        if (!currentRamoIsMulti && (scope.ramo.selected)){
                            scope.ramo.selected = false;
                            scope.$apply();
                        }
                        ramosSelection.setRamosItemEnabled(scope.ramo);
                    }
                });
            }
        };
    }])
    
    .service('ramosProperties', function () {

        var ramosArray = [];
        var viviendaSelected = false;

        this.setViviendaSelected = function(booleanVal) {
            viviendaSelected = booleanVal;
        };
        this.getViviendaSelected = function(booleanVal) {
            return viviendaSelected;
        };
        this.setRamosArray = function(newObj) {
            ramosArray.push(newObj);
            return [].concat(ramosArray);
        };
        this.getRamosArray = function(){
            // will return a copy of the getRamosArray at the time of request
            return [].concat(ramosArray);
        };
        this.clear = function(){
            ramosArray = [];
            return [].concat(ramosArray);
        };
    })

    /**
     * Intenden to share the boolean selection of ramos items
     */
     .service('ramosListSharedData', function ($rootScope, menuRamosServ) {
        var that = this;
        this.ramosListMap = {};
        this.existsAnySelection = false;
        
        $rootScope.$watch(function(){
            return menuRamosServ.ramos;
        }, function(newCollection){
            newCollection.forEach(function(item){
            	if (item.available) {
            		that.setItem(item.cdRamo, item.selected);
            	}
            });
        }, true);

        this.setItem = function(code, selected) {
            this.ramosListMap["ramo" + code] = selected;
        };
        this.setItemSelected = function(ramo){
            this.ramosListMap["ramo" + ramo.cdRamo] = ramo.selected;
        };
        this.isItemSelected = function(ramo){
            return this.ramosListMap["ramo" + ramo.cdRamo];
        };
     })
     .service('menuRamosServ', ['formsRepo', function(formsRepo){
		 var that = this;
    	 this.ramos = [];
    	 this.selectedRamos = [];
    	 
    	 this.setRamos = function(selectedRamos){
    		 that.ramos = [];
    		 this.selectedRamos = selectedRamos;
    		 
    		 formsRepo.getMenuRamos(function (data) {
    			 	var ramos = data;
    			 	var dataOrdered = [];
    			 	var obj = [];
    			 	var cdRamos = ['21','18','1','19','20','40','24','25','26'];
    			 	cdRamos.forEach(function(ramo){
    			 		obj = $.map(ramos, function(item, index){ if(item.cdRamo == ramo){ return item;};});
    			 		that.ramos.push(obj[0]);
    			 	});
    	            data.forEach(function(item){
                        if (selectedRamos && selectedRamos.indexOf(item.cdRamo)>=0 && item.isMulti){
                            item.selected = true;
                        }
    	            });
    	        });
    	 };
    	 this.getRamos = function(){
    		 return this.ramos;
    	 };
    	 this.getSelectedRamos = function(){
    		 return this.selectedRamos;
    	 };
    	 
    	 this.resetRamos = function(){
    		 this.ramos = [];
    		 this.selectedRamos = [];
    	 };
    	 
    	 
         this.getRamoById = function (cdRamo) {
             return $.grep(this.ramos, function(item){ return item.cdRamo == cdRamo; });
         };
    	 
     }]);

})();