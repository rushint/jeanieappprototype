(function(){

  angular.module('ionicApp')

      .controller('SigninCtrl', function($scope, $state, AuthService, $ionicLoading, $ionicHistory, dbtStorageService, dbtUtils) {
        var vm = this;

        vm.user = {
          email: "",
          password: ""
        };

        vm.forgotPassword = function() {
            $state.go('auth.forgotpassword', {});
        };

        vm.doSignIn = function () {
          console.log("doing sign in");

          $ionicLoading.show({
            template: 'Signing in ...'
          });

          firebase.auth().signInWithEmailAndPassword(vm.user.email, vm.user.password)
              .then(function(user){
                  console.log('uid',user.uid);

                  $ionicLoading.hide();

                  dbtStorageService.setSignInLS(user.uid);

                  $ionicHistory.nextViewOptions({
                    disableBack: true
                  });

                  $state.go('app.stores', {});
              }).catch(function(error) {
                  // Handle Errors here.
                  var errorCode = error.code;
                  var errorMessage = error.message;

                  $ionicLoading.hide();

                  console.log('errorMessage: ', error.code, errorMessage);
                  dbtUtils.showErrorDialog("Jeanie says ...", errorMessage);
              });

        };
      })
}());
