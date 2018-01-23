(function(){

  angular.module('ionicApp')

      .controller('SignupCtrl', function($scope, $state, $timeout, AuthService, $ionicLoading, $ionicPopup, $ionicHistory, dbtStorageService, dbtUtils) {
        var vm = this;

        var user = null;

        vm.user = {
          name: "",
          email: "",
          password: ""
        };

        vm.facebookAuth = function () {
          console.log('facebookAuth()');

          var provider = new firebase.auth.FacebookAuthProvider();
          console.log('provider: ', provider);

          firebase.auth().signInWithPopup(provider).then(function(result) {
            console.log('signInWithPopup() -> result: ', result);

            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            var token = result.credential.accessToken;
            console.log('token: ', token);

            // The signed-in user info.
            var user = result.user;
            // ...
            console.log('user: ', user);
          }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
            console.log('errorMessage: ' + errorMessage + " - email: " + email + " - credential: " + credential);
          });
        };

        var showAlert = function(msg) {
            var alertPopup = $ionicPopup.alert({
              title: 'Jeanie says',
              template: msg
            });

            alertPopup.then(function(res) {
              console.log('Ok');
            });
        };

        vm.goSignIn = function() {
          $state.go('auth.signin', {});
        };

        vm.doSignUp = function () {
          console.log("doing sign up");

          $ionicLoading.show({
            template: 'Signing up...'
          });

          firebase.auth().createUserWithEmailAndPassword(vm.user.email, vm.user.password)
            .then(function(user){
              console.log('uid',user.uid)

              if(user) {
                user.updateProfile({
                  displayName: vm.user.name
                }).then(function() {
                  // Update successful.
                  console.log('User Profile Updated');

                  dbtStorageService.setSignInLS(user.uid);

                  $ionicHistory.nextViewOptions({
                    disableBack: true
                  });

                  $state.go('app.stores', {});
                }, function(error) {
                  // An error happened.
                  console.log('User Profile Error: ', error);

                  dbtUtils.showErrorDialog("Jeanie says ...", error.message);
                });
              } else {
                console.log('No User');

                dbtUtils.showErrorDialog("Jeanie says ...", "Sorry, no user was found");
              }
            }).catch(function(error) {
                console.log('errorMessage: ', error.code, error.message);

                $ionicLoading.hide();

                dbtUtils.showErrorDialog("Jeanie says ...", error.message);
          });

        };

      });

}());
