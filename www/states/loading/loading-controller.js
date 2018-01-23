(function(){

    angular.module('ionicApp')

        .controller('LoadingCtrl', function($rootScope, $scope, $state, $q, $http, $timeout, $ionicLoading, dbtApp, dbtStorageService, AuthService, dbtUtils, dbtConciergeIOS, dbtConciergeAndroid, config) {

            var vm = this;

            var openPage = function(state) {
              $timeout(function() {
                $state.go(state, {});
              }, 500)
            };

            //var isUserEqual = function(facebookAuthResponse, firebaseUser) {
            //  if (firebaseUser) {
            //    var providerData = firebaseUser.providerData;
            //    for (var i = 0; i < providerData.length; i++) {
            //      if (providerData[i].providerId === firebase.auth.FacebookAuthProvider.PROVIDER_ID &&
            //        providerData[i].uid === facebookAuthResponse.userID) {
            //
            //        // We don't need to re-auth the Firebase connection.
            //        return true;
            //      }
            //    }
            //  }
            //
            //  return false;
            //};

            // Init Firebase
            var initFirebase = function() {
              // Initialize Firebase
              console.log('Initialize Firebase');

              var config = {
                apiKey: "AIzaSyAZ4JCyFYAdFKZO8jbQthHlqaxUro2zITE",
                authDomain: "genii-ed5b0.firebaseapp.com",
                databaseURL: "https://genii-ed5b0.firebaseio.com",
                storageBucket: "gs://genii-ed5b0.appspot.com"
              };
              dbtApp.fbApp = firebase.initializeApp(config);

              dbtApp.fbStorage = firebase.storage();
              dbtApp.fbMapsStorageRef = dbtApp.fbStorage.ref();

              // Is user already logged in??
              firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                  console.log('User is signed in');

                  var myStore = dbtStorageService.getMyStoreLS();
                  if(myStore) {
                    console.log('Have set my store');

                    //$state.go('app.mystorecat1', {});
                    openPage('app.mystorecat1');
                  } else {
                    console.log('Have NOT set my store');

                    //$state.go('app.stores', {});
                    openPage('app.stores');
                  }
                } else {
                  console.log('User is NOT signed in');

                  //$state.go('auth.walkthrough', {});
                  openPage('auth.walkthrough');
                }
              });
            };

            //var checkLoginState = function(event) {
            //  console.log('checkLoginState()');
            //
            //  if (event.authResponse) {
            //    console.log('event.authResponse: ', event.authResponse);
            //
            //    // User is signed-in Facebook.
            //    var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
            //      unsubscribe();
            //
            //      // Check if we are already signed-in Firebase with the correct user.
            //      if (!isUserEqual(event.authResponse, firebaseUser)) {
            //
            //        // Build Firebase credential with the Facebook auth token.
            //        var credential = firebase.auth.FacebookAuthProvider.credential(
            //          event.authResponse.accessToken);
            //
            //        // Sign in with the credential from the Facebook user.
            //        firebase.auth().signInWithCredential(credential).catch(function(error) {
            //
            //          // Handle Errors here.
            //          var errorCode = error.code;
            //          var errorMessage = error.message;
            //
            //          // The email of the user's account used.
            //          var email = error.email;
            //
            //          // The firebase.auth.AuthCredential type that was used.
            //          var credential = error.credential;
            //
            //          console.log('error: ', JSON.stringify(error));
            //        });
            //      } else {
            //        // User is already signed-in Firebase with the correct user.
            //      }
            //    });
            //  } else {
            //    // User is signed-out of Facebook.
            //    firebase.auth().signOut();
            //  }
            //};
            //
            //var initFacebook = function() {
            //  FB.init({
            //    appId      : '1068711229885161',
            //    status     : true,
            //    xfbml      : true,
            //    version    : 'v2.6'
            //  });
            //
            //  FB.Event.subscribe('auth.authResponseChange', checkLoginState);
            //};

            function init() {
                var resetDB = false;

                dbtStorageService.initJeanieDBWeb(resetDB);  // true == reset data

                // Check for network connectivity
                dbtUtils.checkConnection().then(function(conn){
                  console.log(':: checkConnection() -> conn: ', conn);

                  if(conn == "No network connection"){
                    dbtUtils.showErrorDialog("Jeanie Connectivity", "You must have connectivity to use Jeanie. Please activate to WiFi or a Cellular network and try again.");
                  } else {
                    $http({
                      method: 'GET',
                      url: "http://doubleblacktech.com/genii-app/manifest.json"
                    }).then(
                      function success(resp) {
                        var response = resp;

                        console.log('manifest resp: ', resp);

                        initFirebase();

                        //initFacebook();
                      },
                      function failure(resp) {
                        console.log('failure resp: ', resp);
                      }
                    );
                  }
                }, function(err) {
                  console.log(':: checkConnection() -> err: ', err);

                  dbtUtils.showErrorDialog("Jeanie Connectivity", "You must have connectivity to use Jeanie. Please activate to WiFi or a Cellular network and try again.");
                });
            }

            init();

            $rootScope.$on('enableSpeechEvent', function(event, param) {
              if(config.isIOS) {
                //dbtConciergeIOS.initSpeech();
              } else if(config.isAndroid) {
                dbtConciergeAndroid.initSpeech();
              }
            });
        })

}());
