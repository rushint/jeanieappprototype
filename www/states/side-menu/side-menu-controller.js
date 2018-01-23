(function(){

    angular.module('ionicApp')

        .controller('AppCtrl', function($rootScope, $scope, $state, $ionicSideMenuDelegate, $ionicHistory, dbtUtils, dbtApp, dbtStorageService, dbtConcierge, dbtConciergeIOS, dbtConciergeAndroid, config) {

            var vm = this;

            var isSignedIn = null;

            var myStore = dbtStorageService.getMyStoreLS();

            vm.concierge = {};
            vm.concierge.responseText = "What can I find for you today?";
            vm.concierge.requestText = "";

            vm.currStoreObj = dbtStorageService.getMyStoreLS();
            vm.hasStore = false;

            vm.showConcierge = false;
            vm.displayConcierge = false;
            vm.speakState = 1;

            if(dbtStorageService.getSignInLS()) {
              vm.signInSignOut = "Sign Out";
              isSignedIn = true;
            } else {
              vm.signInSignOut = "Sign In";
              isSignedIn = false;
            }

            $scope.goBackHandler = function () {
                window.history.back();
            };


            vm.toggleLeftMenu = function() {
                $ionicSideMenuDelegate.toggleLeft();
            };

            vm.toggleRightMenu = function() {
                $ionicSideMenuDelegate.toggleRight();
            };

            vm.goHistory = function() {
                $state.go('app.history', {});
            };

            vm.goMyList = function() {
              dbtConcierge.cancelTimer();

              currStoreObj = dbtStorageService.getMyStoreLS();

              if(String(currStoreObj) == "null" || currStoreObj == ""){
                dbtUtils.showErrorDialog("Jeanie says ...","Please choose your store first.");

                $state.go('app.stores', {});
              } else {
                $state.go('app.mylists', {});
              }
            };

            /* **************************************************** */
            // Concierge-related Methods
            /* **************************************************** */

            var conciergeState = "RESTING";    // 'RESTING', 'ENABLED', 'ACTIVE', 'WAITING'

            vm.showSpeechHint = function() {
              var res = false;

              myStore = dbtStorageService.getMyStoreLS();

              vm.currState = $ionicHistory.currentView().stateName;
              if(myStore && (vm.currState == "app.mystorecat1" || vm.currState == "app.mystorecat2") && conciergeState == "ENABLED") {
                res = true;
              }

              return res;
            };

            vm.showSpeechButton = function() {
              var res = false;

              myStore = dbtStorageService.getMyStoreLS();

              vm.currState = $ionicHistory.currentView().stateName;
              if(myStore && (vm.currState == "app.mystorecat1" || vm.currState == "app.mystorecat2")) {
                res = true;
              }

              return res;
            };

            var enableConcierge = function() {
                conciergeState = "ENABLED";

                vm.showConcierge = true;
                vm.displayConcierge = true;
            };

            var activateConcierge = function() {
                conciergeState = "ACTIVE";

                if(config.isIOS) {
                    //dbtConciergeIOS.startListening();
                } else if(config.isAndroid) {
                    dbtConciergeAndroid.startListening();
                }
            };

            var waitConcierge = function() {
                conciergeState = "WAITING";

                if(config.isIOS) {
                  //dbtConciergeIOS.stopListening();
                } else if(config.isAndroid) {
                  dbtConciergeAndroid.stopListening();
                }
            };

            var cancelConcierge = function() {
              conciergeState = "ENABLED";

              if(config.isIOS) {
                //dbtConciergeIOS.resetConcierge();
              } else if(config.isAndroid) {
                dbtConciergeAndroid.resetConcierge();
              }

              vm.showConcierge = true;
              vm.displayConcierge = true;
            };

            var resetConcierge = function() {
                conciergeState = "RESTING";

                if(config.isIOS) {
                  //dbtConciergeIOS.resetConcierge();
                } else if(config.isAndroid) {
                  dbtConciergeAndroid.resetConcierge();
                }

                vm.showConcierge = false;
                vm.displayConcierge = false;
            };

            $scope.toggleConcierge = function() {
                switch(conciergeState) {
                  case 'RESTING':
                    enableConcierge();

                    break;
                  case 'ENABLED':
                    activateConcierge();

                    break;
                  case 'ACTIVE':
                    waitConcierge();

                    break;
                  case 'WAITING':
                    cancelConcierge();

                    break;
                  default:
                    resetConcierge();
                }

              return true
            };

            $scope.hideConcierge = function() {
                conciergeState = "RESTING";

                vm.speakState = 1;
                vm.showConcierge = false;
                vm.displayConcierge = false;
            };

            vm.goMap = function() {
              dbtApp.categoryName = vm.concierge.requestText;
              dbtApp.currResponse = vm.concierge.responseText;

              //currStoreObj = dbtStorageService.getMyStoreLS();

              $state.go('app.map', {});
            };

            ////////////////////////////////////

            vm.goMyStore = function() {
              $scope.hideConcierge()

              currStoreObj = dbtStorageService.getMyStoreLS();

              if(String(currStoreObj) == "null" || currStoreObj == ""){
                dbtUtils.showErrorDialog("Jeanie says ...","Please choose your store first.");

                $state.go('app.stores', {});
              } else {
                $state.go('app.mystorecat1', {});
              }
            };

            vm.signInOut = function() {
              dbtConcierge.cancelTimer();

              if(isSignedIn == true){
                firebase.auth().signOut();

                dbtStorageService.setSignInLS("");
                dbtStorageService.setMyStoreLS("");
                dbtApp.currStoreObj = null;
                dbtApp.isSignObj = null;
              }

              $state.go('auth.walkthrough', {});
            };

            ////////////////////////////////////

            $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState, fromParams){
                    if(fromState.name != "app.mystorecat1" && fromState.name != "app.mystorecat2") {
                      cancelConcierge();
                    }

                    $scope.hideConcierge();

                    vm.currState = toState.name;

                    vm.currStoreObj = dbtStorageService.getMyStoreLS();
                }
            );

            $rootScope.$on('speakStateChange',
              function(event, data){
                vm.speakState = data.num;
              }
            );

            $rootScope.$on('responseChange',
              function(event, data){
                console.log('on -> responseChange: ', data);

                vm.concierge.responseText = data.msg;
                dbtApp.currResponse = vm.concierge.responseText;
              }
            );

            $rootScope.$on('requestChange',
              function(event, data){
                console.log('on -> requestChange', data);

                vm.concierge.requestText = data.msg;
                dbtApp.categoryName = vm.concierge.requestText;
              }
            );

            $rootScope.$on('buttonStateChange',
              function(event, data){
                conciergeState = data.state;
              }
            );
        })

}());
