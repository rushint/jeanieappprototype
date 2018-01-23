(function(){

  angular.module('ionicApp')

    .controller('WalkthroughCtrl', function($rootScope, $scope, $state, $ionicLoading, config, dbtApp) {

      var vm = this;

      function init() {
        //window.ga.trackView('Walkthrough')
      }

      vm.facebookAuth = function () {
        console.log('facebookAuth()');

        var provider = new firebase.auth.FacebookAuthProvider();
        console.log('provider: ', provider);

        firebase.auth().signInWithRedirect(provider).then(function(result) {
        //firebase.auth().signInWithPopup(provider).then(function(result) {
          console.log('signInWithRedirect() -> result: ', result);

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

      vm.signUp = function() {
        $state.go('auth.signup', {});
      };

      vm.signIn = function() {
        $state.go('auth.signin', {});
      };

      init();
    })

}());
