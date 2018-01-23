(function(){
    angular
        .module('ionicApp')

        .factory('dbtConcierge', function($rootScope, $timeout, $q, $http, dbtSounds, dbtApp, dbtStorageService, config) {
            var service = {};

            //service.newFile = "new-audio-file-" + Math.floor(Date.now() / 1000) + ".wav";
            var fileName = "genii-audio-file.wav";
            var baseURL = dbtApp.manifest.bluemixURL + "genii_stt.php";

            var recorder = new Object;

            var mySayings = [
              "Thank you. Please wait.",
              "OK. Hold on.",
              "Thanks. Please wait.",
              "OK. Please wait.",
              "Thanks. Hold on."
            ];

            var randSaying;

            var currStoreObj = dbtStorageService.getMyStoreLS();

            var ft;

            ////////////////////////////////////

            service.mediaRec;
            service.mediaPlay;

            service.isConnected = false;

            service.currStore = currStoreObj.name;

            service.requestText = "where is the popcorn";
            service.speakState = 1;
            service.dateSpoken = Date.now();
            service.responseText = "What can I find for you today?";
            service.errorText = "";
            service.useful = 0;

            service.currAnim = "";

            service.isListening = false;
            service.isUploading = false;
            service.isComplete = true;
            service.isAudioCaptured = false;
            service.isInProgress = false;
            service.haveSTT = false;
            service.haveTTS = false;
            service.locationFound = false;

            service.isConcierge = false;

            service.timer = null;

            ////////////////////////////////////

            var uploadSuccess = function (r) {
              console.log(':: uploadSuccess()');

              ft = null;
              service.isAudioCaptured = false;
              service.isInProgress = false;
              service.isListening = false;
              service.isUploading = false;

              var response = JSON.parse(r.response);

              //$scope.$apply(function () {
              //  console.log('response.results.length: ', response.results.length);

                if(response.results.length > 0) {
                  service.haveSTT = true;

                  service.dateSpoken = Date.now();

                  service.requestText = response.results[0].alternatives[0].transcript;
                  service.requestText = service.requestText.replace("%HESITATION", "");
                  sendRequest(service.requestText);
                  console.log('this is what you said: ', service.requestText);

                  //dbtConversation.questionText = service.requestText;

                  // Phase II - Retrieve answer to question (IBM Watson Conversation)
                  //getAnswer(service.textSpoken);

                  //getSynthesis("Searching");

                } else {
                  service.errorText = JSON.stringify(response);

                  service.isAudioCaptured = false;
                  service.isInProgress = false;
                  service.isListening = false;
                  service.isUploading = false;
                  service.isComplete = true;
                  service.haveSTT = false;
                  service.speakState = 1;

                  service.responseText = "I'm sorry. I couldn't understand what you said. Could you please try again? What can I find for you today?";
                  sendResponse(service.responseText);

                  service.requestText = "";
                  sendRequest(service.requestText);

                  //getSynthesis(service.responseText);
                }
                //}, 200);
              //});
            };

            var uploadFail = function (error) {
              //$scope.$apply(function () {
                ft = null;

                service.isInProgress = false;
                service.isListening = false;

                service.responseText = "An error occured while processing your request. Could you please try again?";
                sendResponse(service.responseText);

                service.requestText = "";
                sendRequest(service.requestText);

                //getSynthesis(service.initialPrompt);

                service.speakState = 1;

                console.log("upload error source: " + error.source);
                console.log("upload error target: " + error.target);
              //});
            };

            function uploadAudio() {
              console.log('uploadAudio() :: ');

              // http://stackoverflow.com/questions/25198840/document-directory-path-of-ios-8-beta-simulator
              if (cordova.file.documentsDirectory) {
                service.directory = cordova.file.documentsDirectory;     // for iOS
                service.fullPath = service.directory + fileName;
              } else {
                service.directory = cordova.file.externalDataDirectory;  // cordova.file.externalRootDirectory;  // for Android
                service.fullPath = service.directory + fileName;
              }

              console.log('service.fullPath: ', service.fullPath);

              // Path and File on device
              service.localURL = service.directory.replace("file://", "") + fileName;

              // File on server
              var newFile = "genii-audio-file-" + Math.floor(Date.now() / 1000) + ".wav";

              var options = new FileUploadOptions();
              options.fileKey = "audio";
              options.fileName = newFile;
              options.mimeType = "audio/wav";
              options.chunkedMode = false;

              ft = new FileTransfer();
              ft.upload(service.localURL, encodeURI(baseURL), uploadSuccess, uploadFail, options);
            }

            var cycleWait = function() {
              console.log('cycleWait() ', service.speakState);

              if(service.isInProgress) {

                if (service.speakState == 4) {
                  service.speakState = 5;
                } else if (service.speakState == 5) {
                  service.speakState = 6;
                } else if (service.speakState == 6) {
                  service.speakState = 7;
                } else if (service.speakState == 7) {
                  service.speakState = 8;
                } else if (service.speakState == 8) {
                  service.speakState = 9;
                } else if (service.speakState == 9) {
                  service.speakState = 10;
                } else if (service.speakState == 10) {
                  service.speakState = 5;
                } else {
                  service.speakState = 5;
                }

                $rootScope.$broadcast('speakStateChange', {
                  num: service.speakState
                });

                service.timer = $timeout(function () {
                  cycleWait();
                }, 200);

              }
            };

            var playTone = function() {
              console.log('playTone()');

              service.mediaPlay = new Media("sounds/A-Tone-His_Self-1266414414.wav",
                // success callback
                function (resp) {
                  console.log('playTone success callback');

                  service.mediaPlay = null;
                },

                // error callback
                function (err) {
                  console.log("playTone():Audio Error: " + err.code + " - " + err.message);

                  service.mediaPlay = null;
                }
              );

              // Play audio
              service.mediaPlay.play();
            };

            recorder.stop = function() {
              console.log('recorder.stop()');

              service.isAudioCaptured = true;

              service.mediaRec.stopRecord();
            };

            recorder.record = function() {
              console.log('recorder.record()');

              var src = "documents://" + fileName;

              if(Media) {

                service.mediaRec = new Media(src,
                  // success callback
                  function (resp) {
                    console.log('audio record success callback');

                    //Play A-Tone-His_Self-1266414414.wav
                    playTone();

                    cycleWait();

                    service.mediaRec = null;

                    service.isAudioCaptured = true;
                    service.isListening = false;
                    service.isAudioCaptured = true;
                    service.isUploading = true;

                    sendResponse("Thank you. Please wait ...");

                    randSaying = Math.floor(Math.random()*((mySayings.length-1)-0+0)+0);
                    service.getSynthesis(mySayings[randSaying]);

                    // Phase I - Transcribe audio to text (IBM Watson Speech To Text)
                    uploadAudio();
                  },

                  // error callback
                  function (err) {
                    console.log("recordAudio():Audio Error: " + err.code + " - " + err.message);

                    service.cancelTimer();

                    service.mediaRec = null;

                    service.isAudioCaptured = false;
                    service.isListening = false;
                    service.isAudioCaptured = false;
                    service.isUploading = false;
                    service.speakState = 1;

                    sendResponse("I'm sorry. I wasn't able to fullfill your request. Could you please try again? What can I find for you today?");

                    service.getSynthesis("I'm sorry. I wasn't able to fullfill your request. Could you please try again?");
                  }
                );

                // Record audio
                service.mediaRec.startRecord();

                // Stop recording after 4 seconds
                $timeout(function () {
                  if (!service.isAudioCaptured && service.isListening) {
                    console.log('Stopping recording due to timeout');

                    service.isListening = false;
                    service.cancelTimer();

                    service.speakState = 5;

                    recorder.stop();
                  }
                }, 4000);
              } else {

                // The Media object does not exist - app is not running on device
                sendResponse("What can I find for you today?");
                service.concierge.requestText = "";

                service.haveSTT = false;
                service.haveTTS = false;
                service.isComplete = false;
                service.isInProgress = false;
                service.isListening = false;

                service.speakState = 1;
              }
            };

            var resetVariables = function() {
              service.responseText = "What can I find for you today?";
              sendResponse(service.responseText);

              service.requestText = "";
              sendRequest(service.requestText);

              service.haveSTT = false;
              service.haveTTS = false;
              service.isComplete = false;
              service.isInProgress = false;
              service.isListening = false;
            };

            var cycleListening = function() {
              console.log('cycleListening() ', service.speakState);

              if(service.isListening) {

                if (service.speakState == 1) {
                  service.speakState = 2;
                } else if (service.speakState == 2) {
                  service.speakState = 3;
                } else if (service.speakState == 3) {
                  service.speakState = 4;
                } else if (service.speakState == 4) {
                  service.speakState = 2;
                }

                $rootScope.$broadcast('speakStateChange', {
                  num: service.speakState
                });

                service.timer = $timeout(function () {
                  cycleListening();
                }, 300);

              }
            };

            var sendResponse = function(msg) {
              //$rootScope.$broadcast('responseChange', {
              //  msg: msg
              //});
            };

            var sendRequest = function(msg) {
              //$rootScope.$broadcast('requestChange', {
              //  msg: msg
              //});
            };

            ////////////////////////////////////

            service.getAnswer = function(txt) {
              console.log('getAnswer() :: txt: ', txt);

              var deferred = $q.defer();

              var urlConversation = dbtApp.manifest.bluemixURL + "genii_conversation.php?text=" + encodeURI(txt);

              var locationText = "";
              var errorText = "";

              $http({
                method: 'GET',
                url: urlConversation
              }).then(
                function success(resp) {
                  var response = resp;
                  console.log('response: ', JSON.stringify(response));

                  if(response.data.output) {
                    locationText = response.data.output.text[0];

                    //var ndx = locationText.indexOf("I'm sorry");
                    //if (ndx < 0) {
                    //  service.locationFound = true;
                    //} else {
                    //  service.locationFound = false;
                    //}

                    deferred.resolve(locationText);
                  } else {
                    locationText = "I'm sorry. I couldn't find the location";

                    deferred.resolve(locationText);
                  }
                },
                function failure(resp) {
                  errorText = "I'm sorry. I couldn't find the location";

                  deferred.resolve(errorText);
                }
              );

              return deferred.promise;
            };

            // https://developers.google.com/web/updates/2014/01/Web-apps-that-talk-Introduction-to-the-Speech-Synthesis-API?hl=en
            // https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#tts-section
            // https://www.sitepoint.com/introducing-web-speech-api/
            // https://www.npmjs.com/package/tts-speak
            service.getSynthesis = function(txt) {
              console.log('getSynthesis() :: ');

              var myRate = 1.5;

              if(config.hardPlatform == 'ios') {

                if (!config.deviceInformation.isVirtual) {

                  if (config.deviceInformation.version && config.deviceInformation.version.charAt(0) == '9') {
                    myRate = 1.5;
                  } else {
                    myRate = 0.6;
                  }

                }

              } else if(config.hardPlatform == 'android') {
                myRate = 1;
              }

              TTS.speak({
                text: txt,
                locale: 'en-US',
                rate: myRate
              }, function () {
                console.log('Speech Finished');
              }, function (reason) {
                console.log('Speech Error: ', reason);
              });
            };

            service.cancelTimer = function() {
              if(service.timer){
                $timeout.cancel( service.timer );

                service.speakState = 1;
                service.isListening = false;
              }
            };

            service.startListening = function() {
              // NOTE: Must be in this order
              resetVariables();   // 1)

              service.isListening = true;   // 2)
              service.isInProgress = true;  // 3)

              cycleListening();   // 4)

              sendResponse("I'm listening ...");

              recorder.record();
            };

            service.stopListening = function() {
              if(!service.isAudioCaptured && service.isListening) {
                console.log('stopListening()');

                service.isListening = false;

                service.speakState = 5;

                recorder.stop();
              }
            };


            ////////////////////////////////////

            return service;
        })
}());
