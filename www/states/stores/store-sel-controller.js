(function(){

    angular.module('ionicApp')

        .controller('StoreSelCtrl', function($rootScope, $scope, $state, $http, $q, $ionicLoading, dbtApp, dbtStorageService) {

            var vm = this;

            vm.currMap = "http://67.media.tumblr.com/6690e65ba61a4d955350507ab561b76b/tumblr_mr4d0matqA1sdcasco4_1280.jpg";

            vm.products = [];

            vm.currStoreObj = dbtApp.getCurrStoreObj();

            vm.myStoreCode = vm.currStoreObj.storeCode;

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

            var init = function() {
                //$ionicLoading.show({
                //    template: 'Loading Products. Please wait ...'
                //});
                //
                //getProducts().then(function(res){
                //    vm.products = res;
                //
                //    console.log('vm.products: ', vm.products);
                //
                //    $ionicLoading.hide();
                //})
            };

            vm.setMyStore = function(obj) {
                vm.currLocation = obj.storeCode;

                //dbtStorageService.setMyStoreLS("myStoreCode", obj.storeCode);
                //dbtStorageService.setMyStoreLS("myStoreName", obj.name);

                dbtStorageService.setMyStoreLS(obj);
                dbtApp.setCurrStoreObj(obj);

                $state.go('app.mystorecat1', {});
            };

            vm.goConcierge = function() {
                $state.go('app.mystore', {});
            };

            init();

        })

}());
