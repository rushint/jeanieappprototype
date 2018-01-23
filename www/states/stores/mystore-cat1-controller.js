(function(){

    angular.module('ionicApp')

        .controller('MyStoreCat1Ctrl', function($rootScope, $scope, $state, $http, $q, $ionicLoading, $ionicModal, $timeout, config, dbtApp, dbtStorageService, dbtUtils, dbtSounds, dbtConversation) {

            var vm = this;

            vm.myStoreObj = dbtStorageService.getMyStoreLS();

            var paddedProductCategoryId = "000";

            vm.currMap = dbtApp.manifest.baseURL + "maps/maps-14939/safeway-14939-"+paddedProductCategoryId+".png";

            vm.products = [];
            vm.selectedProductId = null;

            var getProducts = function () {
              var deferred = $q.defer();

              var urlSearch = dbtApp.manifest.baseURL + "getProductCategory.php";

              $http({
                  method: 'GET',
                  url: urlSearch
              }).then(
                function success(resp) {
                    var products = resp.data.data;

                    dbtApp.origProducts = products;

                    var subCatFound = false;
                    var cat1Products = [];
                    var numCat = 0;
                    var numSubCat = 0;

                    for(var i = 0; i < products.length; i++){
                        if(products[i].categoryName == "Flowers") {
                          console.log('ok');
                        }
                        if(products[i].level2 == "0") {
                            if(subCatFound){
                              subCatFound = false;
                              cat1Products[numCat-1].subCatCnt = numSubCat;
                              numSubCat = 0;
                            }

                            // Push next category
                            cat1Products.push(products[i]);
                            numCat++;
                        } else {

                          // This is a sub-category
                          subCatFound = true;
                          numSubCat++;
                        }
                    }

                    dbtApp.allProducts = cat1Products;

                    deferred.resolve(cat1Products);
                },
                function failure(resp) {
                  console.log('failure resp: ', JSON.stringify(resp));

                  deferred.reject({});
                }
              );

              return deferred.promise;
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
                if(dbtApp.allProducts.length > 0) {
                  cat1Products = dbtApp.allProducts;

                  vm.products = cat1Products;

                  vm.products.sort(dynamicSort("categoryName"));

                } else {
                  $ionicLoading.show({
                    template: 'Loading Products. Please wait ...'
                  });

                  getProducts().then(function (res) {
                    vm.products = res;

                    vm.products.sort(dynamicSort("categoryName"));
                    //console.log('vm.products: ', vm.products);

                    $ionicLoading.hide();
                  })
                }
            };

            vm.goStores = function() {
                $state.go('app.stores', {});
            };

            vm.getCat2 = function(obj) {
              console.log('obj: ', obj);

              if(obj.hasOwnProperty('subCatCnt')) {
                  dbtApp.selProductCat = obj.level1;

                  dbtSounds.getSynthesis("You chose " + obj.categoryName);

                  $state.go('app.mystorecat2', {});
              } else {
                getMap(obj);
              }

            };

          var getMap = function(obj) {
            console.log('obj: ', obj);

            dbtApp.categoryName = obj.categoryName;
            console.log('getMap() -> obj.categoryName: ', obj.categoryName);

            dbtSounds.getSynthesis("You chose " + obj.categoryName);

            $ionicLoading.show({
              template: 'Finding Product. Please wait ...'
            });

            dbtConversation.getAnswer(obj.categoryName).then(function(resp) {
              dbtApp.currResponse = resp;
              dbtApp.currProductCategoryId = dbtUtils.pad(obj.productCategoryId, 3);
              //console.log('dbtApp.currProductCategoryId: ', dbtApp.currProductCategoryId);

              $ionicLoading.hide();

              $state.go('app.map', {});
            });
          };





            vm.openConcierge = function() {
              vm.conciergeOpen = true;
            }

            init();
        })

}());
