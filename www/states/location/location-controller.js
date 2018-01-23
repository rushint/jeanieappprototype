(function(){

    angular.module('ionicApp')

        .controller('LocationCtrl', function($rootScope, $scope, $state) {

            var vm = this;

            vm.toggleLeftMenu = function() {
                $ionicSideMenuDelegate.toggleLeft();
            };

            vm.toggleRightMenu = function() {
                $ionicSideMenuDelegate.toggleRight();
            };

            $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState, fromParams){
                    vm.currState = toState.name;
                }
            );
        })

}());
