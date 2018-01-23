(function(){

    angular.module('ionicApp')

        .controller('AuthCtrl', function($rootScope, $scope, $state, $ionicSideMenuDelegate, dbtStorageService) {

            var vm = this;

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
                if(dbtStorageService.inConversation) {
                    dbtStorageService.saveSetConversation();
                }

                $state.go('app.history', {});
            };

            vm.skipAuth = function() {
                console.log('skipAuth()');

                dbtStorageService.setSkipLS("TRUE");

                $state.go('app.stores', {});
            };

            $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState, fromParams){
                    console.log('$stateChangeStart');

                    vm.currState = toState.name;
                }
            );
        })

}());
