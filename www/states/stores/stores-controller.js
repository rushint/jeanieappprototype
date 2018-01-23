(function(){

    angular.module('ionicApp')

        .controller('StoresCtrl', function($rootScope, $scope, $state, $ionicLoading, $http, $q, $timeout, dbtStorageService, dbtUtils, dbtApp) {

            var vm = this;

            var myStoreObj = dbtStorageService.getMyStoreLS();

            vm.currLocation = myStoreObj.storeCode || "";
            console.log('vm.currLocation: ', vm.currLocation);

            vm.locations = [];

            var getStores = function () {
              var deferred = $q.defer();

              var urlSearch = dbtApp.manifest.baseURL + "getStores.php";

              $http({
                method: 'GET',
                url: urlSearch
              }).then(
                function success(resp) {
                  var stores = resp.data.data;

                  if(stores == null) {
                    deferred.reject(resp);
                  } else {
                    deferred.resolve(stores);
                  }
                },
                function failure(resp) {
                  console.log('failure resp: ', JSON.stringify(resp));

                  deferred.reject({});
                }
              );

              return deferred.promise;
            };

            vm.goStoreSel = function(obj) {
                dbtApp.setCurrStoreObj(obj);

                $state.go('app.store-sel', {});
            };

            var init = function() {
                $ionicLoading.show({
                  template: 'Loading Stores. Please wait ...'
                });

                getStores().then(function (res) {
                  vm.locations = res;

                  console.log('vm.locations: ', vm.locations);

                  $scope.currLocation = myStoreObj.storeCode || ""; //dbtStorageService.getMyStoreLS("myStore");

                  $ionicLoading.hide();
                }, function() {
                    $ionicLoading.hide();

                    dbtUtils.showErrorDialog("Jeanie Error", "I'm sorry. I encountered a server error. Please try again.");
                })

            };

            init();

        })

}());
