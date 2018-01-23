(function(){

  angular.module('ionicApp')

      .controller('LogInCtrl', function($scope, $state, AuthService, $ionicLoading) {
          $scope.login = function(user) {
            $ionicLoading.show({
              template: 'Loging in ...'
            });

            AuthService.doLogin(user)
              .then(function(user){
                // success
                $state.go('app.user');
                $ionicLoading.hide();
              },function(err){
                // error
                $scope.errors = err;
                $ionicLoading.hide();
              });
          };
        })
}());
