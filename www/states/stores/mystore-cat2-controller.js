(function(){

    angular.module('ionicApp')

        .controller('MyStoreCat2Ctrl', function($rootScope, $scope, $state, $http, $q, $ionicLoading, $ionicModal, $timeout, config, dbtApp, dbtStorageService, dbtUtils, dbtConversation, dbtSounds) {

            var vm = this;

            vm.myStoreObj = dbtStorageService.getMyStoreLS();

            var paddedProductCategoryId = "000";

            vm.currMap = dbtApp.manifest.baseURL + "maps/maps-"+vm.myStoreObj.storeCode+"/"+vm.myStoreObj.storeCode+"-"+paddedProductCategoryId+".png";

            vm.products = [];
            vm.selectedProductId = null;
            vm.cat2Products = [];

            var showPopup = function(msg) {
              var alertPopup = $ionicPopup.alert({
                title: 'Jeanie',
                template: msg
              });

              alertPopup.then(function(res) {
                console.log('YAY!');
              });
            };

            var getProducts = function () {
                var products = dbtApp.origProducts;
                var selProductCat = dbtApp.selProductCat;

                var cat2Products = [];

                for(var i = 0; i < products.length; i++){
                    if(products[i].level1 == selProductCat && products[i].level2 != "0") {
                        cat2Products.push(products[i]);
                    }
                }

                //console.log('cat2Products: ', cat2Products);
                vm.products = cat2Products;
            };

            var dynamicSort = function(property) {
              var sortOrder = 1;
              if(property[0] === "-") {
                sortOrder = -1;
                property = property.substr(1);
              }
              return function (a,b) {
                var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                return result * sortOrder;
              }
            };

            var init = function() {
                dbtUtils.trackView("mystore");

                $ionicLoading.show({
                    template: 'Loading Products. Please wait ...'
                });

                getProducts();

                $ionicLoading.hide();
            };

            vm.goStores = function() {
                $state.go('app.stores', {});
            };

            vm.getMap = function(obj) {
              console.log('obj: ', obj);

              dbtApp.currProductCategoryId = obj.productCategoryId;
              dbtApp.categoryName = obj.categoryName;
              console.log('getMap() -> obj.categoryName: ', obj.categoryName);

              dbtSounds.getSynthesis("You chose " + obj.categoryName);

              $ionicLoading.show({
                template: 'Finding Product. Please wait ...'
              });

              dbtConversation.getAnswer(vm.myStoreObj.workspaceId, obj.categoryName).then(function(resp) {
                  dbtApp.currResponse = resp;
                  dbtApp.currProductCategoryId = dbtUtils.pad(obj.productCategoryId, 3);
                  //console.log('dbtApp.currProductCategoryId: ', dbtApp.currProductCategoryId);

                  $ionicLoading.hide();

                  $state.go('app.map', {});
              });
            };

            init();

        })

}());
