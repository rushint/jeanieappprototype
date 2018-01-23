(function(){

  angular.module('ionicApp')

      .controller('ForgotPasswordCtrl', function($scope, $state, AuthService, $ionicLoading, dbtUtils, dbtStorageService) {
        var vm = this;

        vm.user = {
          email: ""
        };

        vm.resetPassword = function () {
          console.log("Reset Password");

          $ionicLoading.show({
            template: 'Sending password reset ...'
          });

          firebase.auth().sendPasswordResetEmail(vm.user.email)
              .then(function(resp){
                  console.log('resp', resp);

                  $ionicLoading.hide();

                  dbtUtils.showAlertAndWait("Jeanie says ...", "Please check your email for password reset instructions").then(function() {
                      $state.go('auth.walkthrough', {});
                  });

              }).catch(function(error) {
                  // Handle Errors here.
                  var errorCode = error.code;
                  var errorMessage = error.message;

                  $ionicLoading.hide();

                  console.log('errorMessage: ', error.code, errorMessage);

                  if(error.code == "auth/user-not-found") {
                      dbtUtils.showErrorDialog("Jeanie says ...", "You have entered an incorrect email address.");
                  }
              });

        };
      })
}());
