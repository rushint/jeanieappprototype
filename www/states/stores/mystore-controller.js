(function(){

    angular.module('ionicApp')

        .controller('MyStoreCtrl', function($rootScope, $scope, $state, $http, $q, $ionicLoading, $ionicModal, $timeout, config, dbtApp, dbtStorageService, dbtUtils, dbtConversation) {

            var vm = this;

            var myStoreObj = dbtStorageService.getMyStoreLS();

            var paddedProductCategoryId = "000";

            vm.currStore = myStoreObj.name;

            vm.currMap = dbtApp.manifest.baseURL + "maps/maps-14939/safeway-14939-"+paddedProductCategoryId+".png";

            vm.products = [];
            vm.selectedProductId = null;

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
              var deferred = $q.defer();

              var urlSearch = dbtApp.manifest.baseURL + "getProductCategory.php";

              $http({
                  method: 'GET',
                  url: urlSearch
              }).then(
                function success(resp) {
                    var products = resp.data.data;

                    deferred.resolve(products);
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
                dbtUtils.trackView("mystore");

                $ionicLoading.show({
                    template: 'Loading Products. Please wait ...'
                });

                getProducts().then(function(res){
                    vm.products = res;

                    vm.products.sort(dynamicSort("categoryName"));
                    //console.log('vm.products: ', vm.products);

                    $ionicLoading.hide();
                })
            };

            vm.getMap = function(obj) {
              console.log('obj: ', obj);

              dbtConversation.getAnswer(obj.categoryName).then(function(resp) {
                dbtApp.currResponse = resp;
                dbtApp.currProductCategoryId = dbtUtils.pad(obj.productCategoryId, 3);
                console.log('dbtApp.currProductCategoryId: ', dbtApp.currProductCategoryId);

                $state.go('app.map', {});
              });

              //vm.selectedProductId = obj.productCategoryId;

              //paddedProductCategoryId = dbtUtils.pad(obj.productCategoryId, 3);

              //vm.currMap = dbtApp.manifest.baseURL + "maps/maps-14939/safeway-14939-"+paddedProductCategoryId+".png";
            };

            init();

        })

}());
