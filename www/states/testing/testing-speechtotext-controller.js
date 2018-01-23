(function(){

    angular.module('ionicApp')

        .controller('testingSTTCtrl', function($rootScope, $scope, $state, $q, $http, $cordovaFile, $cordovaFileTransfer, $timeout, $ionicLoading, dbtApp, dbtConversation) {

            var vm = this;

            vm.status = '';
            vm.statusText = '';
            vm.directory = '';
            vm.newFile = '';
            vm.isSaved = false;
            vm.localURL = '';
            vm.transcript = '';
            vm.btnState = "Record Audio";
            vm.isListening = false;
            vm.isUploading = false;
            vm.isComplete = true;
            vm.isAudioCaptured = false;
            vm.isInProgress = false;
            vm.isListening = false;

            var ft = null;

            var mediaRec;
            var fileName = "genii-audio-file.wav";
            var baseURL = dbtApp.manifest.bluemixURL + "genii_stt.php";

          var directory = null;
          var localURL = null;

            var recorder = new Object;

            vm.myLog = "";

          var addLog = function(log) {
            vm.myLog = log + "</br>";
          }

          var updateLog = function(log) {
            vm.myLog = vm.myLog + log + "</br>";
          }

          var uploadSuccess = function (r) {
            updateLog('uploadSuccess():');

            //ft = null;
            $scope.isAudioCaptured = false;
            $scope.isInProgress = false;
            $scope.isListening = false;
            $scope.isUploading = false;

            var response = JSON.parse(r.response);
            updateLog('- response:' + JSON.stringify(response));

            $scope.$apply(function () {
              if(response.results && response.results.length > 0) {
                updateLog('- response GOOD');

                $scope.haveSTT = true;

                $scope.dateSpoken = Date.now();
                $scope.textSpoken = response.results[0].alternatives[0].transcript;

                updateLog('$scope.textSpoken: ' + $scope.textSpoken);

                $scope.textSpoken = $scope.textSpoken.replace("%HESITATION", "");

                dbtConversation.questionText = $scope.textSpoken;

                // Phase II - Retrieve answer to question (IBM Watson Conversation)
                //getAnswer($scope.textSpoken);
              } else {
                vm.errorText = JSON.stringify(response);

                updateLog('- ERROR response: ' + JSON.stringify(response));
              }
            });
          };

          var uploadFail = function (error) {
            $scope.$apply(function () {
              ft = null;

              $ionicLoading.hide();

              $scope.isInProgress = false;
              $scope.isListening = false;

              $scope.initialPrompt = "An error occured while processing your request. Could you please try again?";
              getSynthesis($scope.initialPrompt);

              $scope.speakState = 1;

              console.log("upload error source: " + error.source);
              console.log("upload error target: " + error.target);
            });
          };

          function uploadAudio() {
            updateLog('uploadAudio():');

            updateLog('- dbtApp.src: ' + dbtApp.src);
            updateLog('- dbtApp.localURL: ' + dbtApp.localURL);

            // File on server
            var newFile = "genii-audio-file-" + Math.floor(Date.now() / 1000) + ".wav";

            var options = new FileUploadOptions();
            options.fileKey = "audio";
            options.fileName = newFile;
            options.mimeType = "audio/wav";
            options.chunkedMode = false;

            updateLog('- options: ' + JSON.stringify(options));

            var ft = new FileTransfer();
            console.log('ft: ', JSON.stringify(ft));
            ft.upload(dbtApp.localURL, encodeURI(baseURL), uploadSuccess, uploadFail, options);
          }

          vm.processAudio = function() {
            updateLog('uploadAudio():');

            uploadAudio();
          };

          recorder.stop = function() {
            console.log('recorder.stop()');

            $scope.isAudioCaptured = true;

            $scope.mediaRec.stopRecord();
          };

          recorder.record = function() {
            console.log('recorder.record()');

            console.log('record dbtApp.src: ', dbtApp.src);

            if(Media) {

              $scope.mediaRec = new Media(dbtApp.src,
                // success callback
                function (resp) {
                  console.log('success callback -> resp: ', resp);

                  $ionicLoading.show({
                    template: 'Finding your product. Please wait ...'
                  });

                  $scope.mediaRec = null;

                  $scope.isAudioCaptured = true;
                  $scope.isListening = false;
                  $scope.isAudioCaptured = true;
                  $scope.isUploading = true;
                  $scope.speakState = 5;

                  $scope.initialPrompt = "Thank you. Please wait ...";

                  randSaying = Math.floor(Math.random()*((mySayings.length-1)-0+0)+0);
                  getSynthesis(mySayings[randSaying]);

                  // Phase I - Transcribe audio to text (IBM Watson Speech To Text)
                  uploadAudio();

                  //Play A-Tone-His_Self-1266414414.wav
                  //playTone();
                },

                // error callback
                function (err) {
                  console.log("recordAudio():Audio Error: " + err.code + " - " + err.message);

                  $scope.mediaRec = null;

                  resetVariables();

                  dbtUtils.showErrorDialog("Jeanie says ...", "I'm sorry. I wasn't able to fullfill your request. Could you please try again?");
                }
              );

              // Record audio
              $scope.mediaRec.startRecord();

              // Stop recording after 4 seconds
              $timeout(function () {
                if (!$scope.isAudioCaptured && $scope.isListening) {
                  console.log('Stopping recording due to timeout');

                  $scope.isListening = false;

                  $scope.speakState = 5;

                  recorder.stop();
                }
              }, 4000);
            } else {

              // The Media object does not exist - app is not running on device
              $scope.locationText = "";
              $scope.textSpoken = "";

              $scope.haveSTT = false;
              $scope.haveTTS = false;
              $scope.isComplete = false;
              $scope.isInProgress = false;
              $scope.isListening = false;

              $scope.initialPrompt = "What can I find for you today?";

              $scope.speakState = 1;
            }
          };

            vm.recordAudio = function() {
                vm.btnState = "Stop Audio";

                vm.isSaved = false;
                vm.status = '';

                recorder.record();
            };

            function init() {
            }

            init();
        })

}());
