(function(){

    var db = null;

    angular.module('ionicApp', ['ionic', 'ngCordova', 'firebase'])

        .run(function($ionicPlatform, $rootScope, $state, $window, $ionicHistory, $cordovaNetwork, $http, $q, $timeout, dbtStorageService, dbtUtils, dbtApp, googleUtilsService) {
            console.log('.run');

            var resetDB = false;

            $state.go('loading', {});

            /////////////////////////////////////////////////////////////////////
            // $ionicPlatform.ready
            /////////////////////////////////////////////////////////////////////
            $ionicPlatform.ready(function() {
                console.log('- $ionicPlatform.ready');

                if(window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                    cordova.plugins.Keyboard.disableScroll(true);
                }

                if(window.StatusBar) {
                    StatusBar.styleDefault();
                }

                if(window.cordova) {
                    googleUtilsService.initGA();
                }

                //// Check for network connectivity
                //dbtUtils.checkConnection().then(function(conn){
                //    console.log(':: checkConnection() -> conn: ', conn);
                //
                //    if(conn == "No network connection"){
                //        dbtUtils.showErrorDialog("Jeanie Connectivity", "You must have connectivity to use Jeanie. Please activate to WiFi or a Cellular network and try again.");
                //    } else {
                //      $http({
                //        method: 'GET',
                //        url: "http://doubleblacktech.com/genii-app/manifest.json"
                //      }).then(
                //        function success(resp) {
                //          var response = resp;
                //
                //          console.log('manifest resp: ', resp);
                //        },
                //        function failure(resp) {
                //          console.log('failure resp: ', resp);
                //        }
                //      );
                //    }
                //}, function(err) {
                //    console.log(':: checkConnection() -> err: ', err);
                //
                //    dbtUtils.showErrorDialog("Jeanie Connectivity", "You must have connectivity to use Jeanie. Please activate to WiFi or a Cellular network and try again.");
                //});
            });

            /////////////////////////////////////////////////////////////////////
            // deviceready
            /////////////////////////////////////////////////////////////////////
            document.addEventListener("deviceready", function () {
                console.log('- deviceready');

                $rootScope.$broadcast('enableSpeechEvent', {});

                $rootScope.deviceReady = true;

                //// Initialize SQLDB for lists
                dbtStorageService.initJeanieDBDevice(resetDB);  // true == reset data

                // Check to make sure the audio file exists
                if (cordova.file.documentsDirectory) {
                  dbtApp.directory = cordova.file.documentsDirectory;     // for iOS
                  dbtApp.src = "documents://" + dbtApp.fileName;
                  dbtApp.localURL = dbtApp.directory.replace("file://", "") + dbtApp.fileName;     // iOS
                } else {
                  dbtApp.directory = cordova.file.externalRootDirectory + "Download/";  // for Android
                  dbtApp.src = dbtApp.directory + dbtApp.fileName;
                  dbtApp.localURL = dbtApp.src;
                }
                dbtApp.pathToFile = dbtApp.directory + dbtApp.fileName;
                console.log('dbtApp.pathToFile: ', dbtApp.pathToFile);

                // Create audio file
                var makeAudioFile = function() {
                  console.log('makeAudioFile() -> dbtApp.src: ', dbtApp.src);

                  $rootScope.mediaRec = new Media(dbtApp.src,
                    // success callback
                    function (resp) {
                      console.log('$scope.mediaRec success callback -> resp: ', JSON.stringify(resp));
                    },
                    function (err) {
                      console.log("recordAudio():Audio Error: " + JSON.stringify(err));
                    }
                  );

                  // Record audio
                  $rootScope.mediaRec.startRecord();

                  // Stop recording after .5 seconds
                  $timeout(function () {
                    console.log('Stopping recording due to timeout');

                    $rootScope.mediaRec.stopRecord();
                  }, 500);
                };

                // Does file exist?
                window.resolveLocalFileSystemURL(dbtApp.pathToFile, function (fileEntry) {
                    console.log('File Exists');
                }, function(err){
                  console.log("Audio File Does NOT Exist");

                  makeAudioFile();
                });








                // cordova-plugin-media-capture available
                //console.log(navigator.device.capture);

                // http://ngcordova.com/docs/plugins/network/
                //var type = $cordovaNetwork.getNetwork();
                //console.log('$cordovaNetwork.getNetwork() - type: ', type);
                //var isOnline = $cordovaNetwork.isOnline();
                //console.log('$cordovaNetwork.getNetwork() - isOnline: ', isOnline);
                //var isOffline = $cordovaNetwork.isOffline();
                //console.log('$cordovaNetwork.getNetwork() - isOffLine: ', isOffline);
                //
                //// listen for Online event
                //$rootScope.$on('$cordovaNetwork:online', function(event, networkState){
                //    var onlineState = networkState;
                //});
                //
                // //listen for Offline event
                //$rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
                //    var offlineState = networkState;
                //})

            }, false);
        })

        .constant('config', {
            VERSION : '1.0.003',
            BUILD: '003',
            isDeviceBuild: true,         /* *** CHANGE TO true BEFORE CREATING A DEVICE BUILD *** */
            isWebView: ionic.Platform.isWebView(),
            deviceInformation: ionic.Platform.device(),
            hardPlatform: ionic.Platform.platform(),
            isIOS: ionic.Platform.isIOS(),
            isAndroid: ionic.Platform.isAndroid(),
            inDev : true,
            inDebug : false,
            isCordovaApp : !!window.cordova,
            isDevice : window.device
        });

}());
