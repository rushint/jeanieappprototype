(function(){

    angular.module('ionicApp')

        .controller('MapCtrl', function($rootScope, $scope, $state, $timeout, $http, $ionicModal, dbtApp, dbtConversation, dbtSounds, dbtStorageService, dbtUtils) {

            ////////////////////////////////////

            var vm = this;

            var myStoreObj = {};

            vm.productCategoryId = dbtApp.currProductCategoryId;
            vm.categoryName = dbtApp.categoryName
            vm.currResponse = dbtApp.currResponse;

            vm.mapURL = "";

            vm.baseURL = dbtApp.manifest.baseURL;

            vm.gotMap = false;

            ////////////////////////////////////

            var setImageArea = function() {
              var $section = $('section').first();

              $section.find('.panzoom').panzoom({
                $zoomIn: $section.find(".zoom-in"),
                $zoomOut: $section.find(".zoom-out"),
                $zoomRange: $section.find(".zoom-range"),
                $reset: $section.find(".reset")
              });
              //$section.find('.panzoom').panzoom("zoom", 1, {animate: true})

              vm.gotMap = true;
            };

            var init = function() {
              myStoreObj = dbtStorageService.getMyStoreLS();

              dbtApp.fbMapsStorageRef.child('maps/maps-'+myStoreObj.storeCode+'/'+myStoreObj.storeCode+'-'+vm.productCategoryId+'.png').getDownloadURL().then(function(url) {
                console.log('-> url: ', url);

                $scope.$apply(function() {
                  vm.mapURL = url;

                  setImageArea();
                });
              }).catch(function(error) {
                //storage/object-not-found
                console.log('-> error.code: ', error.code);

                if(error.code == 'storage/object-not-found') {
                  dbtApp.fbMapsStorageRef.child('maps/maps-' + myStoreObj.storeCode + '/' + myStoreObj.storeCode + '-000.png').getDownloadURL().then(function (url) {
                    console.log('-> url: ', url);

                    $scope.$apply(function () {
                      vm.mapURL = url;

                      setImageArea();
                    });
                  }).catch(function (error) {
                    console.log('-> error.code: ', error.code);

                    dbtUtils.showErrorDialog("Jeanie says ...", "Sorry, I had trouble getting your map.");

                    vm.gotMap = true;
                  });
                }

              });

            };

            ////////////////////////////////////

            vm.isTTS = function() {
                return dbtSounds.isTTS();
            };

            vm.sayText = function() {
                console.log('sayText() :: ', vm.currResponse);

                dbtSounds.getSynthesis(vm.currResponse);
            };

            init();

        })

}());
