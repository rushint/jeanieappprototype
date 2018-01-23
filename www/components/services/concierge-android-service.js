(function(){
    angular
        .module('ionicApp')

        .factory('dbtConciergeAndroid', function($rootScope, $timeout, $q, $http, dbtSounds, dbtApp, dbtStorageService, config) {
            var service = {};

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

            service.recognition;
            service.isSpeechInit = true;
            service.recognizing = false;

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
            service.haveTTS = false;
            service.locationFound = false;

            service.isConcierge = false;

            service.timer = null;

            ////////////////////////////////////

            service.initSpeech = function() {
              service.recognition = new SpeechRecognition();

              service.isSpeechInit = true;
              service.recognizing = false;

              var currStoreObj = dbtStorageService.getMyStoreLS();

              service.recognition.onresult = function (event) {
                console.log('service.recognition.onresult');

                if (event.results.length > 0) {
                  service.requestText = event.results[0][0].transcript;

                  sendRequest(service.requestText);

                  randSaying = Math.floor(Math.random()*((mySayings.length-1)-0+0)+0);
                  dbtSounds.getSynthesis(mySayings[randSaying]);

                  // Retrieve answer to question (IBM Watson Conversation)
                  service.getAnswer(currStoreObj.workspaceId, service.requestText).then(function(responseText) {
                      sendResponse(responseText);

                      dbtSounds.getSynthesis(responseText);

                      service.speakState = 1;
                      service.isInProgress = false;
                      service.isListening = false;
                      service.recognizing = false;

                      $rootScope.$broadcast('buttonStateChange', {
                        state: "ENABLED"
                      });
                  }, function() {

                  });
                } else {
                  //alert('ERROR');
                }
              }
            };

            service.startListening = function() {
                console.log('startListening()');

                service.isInProgress = true;
                service.isListening = true;
                service.recognizing = true;

                service.speakState = 2;

                service.cancelTimer();

                cycleListening();

                sendResponse("I'm listening ...");

                service.recognition.start();
            };

            service.stopListening = function() {
                console.log('stopListening()');

                if(service.isListening) {
                    service.recognition.stop();

                    service.isListening = false;
                    service.recognizing = false;

                    if(service.timer){
                      $timeout.cancel( service.timer );
                    }

                    service.speakState = 5;

                    cycleWait();

                    sendResponse("Ok, Searching. Please wait ...");
                }
            };


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

                // Stop recording after 4 seconds
                //$timeout(function () {
                //  if (!service.isAudioCaptured && service.isListening) {
                //    console.log('Stopping recording due to timeout');
                //
                //    service.isListening = false;
                //    service.cancelTimer();
                //
                //    service.speakState = 5;
                //
                //    recorder.stop();
                //  }
                //}, 4000);


            var resetVariables = function() {
              service.responseText = "What can I find for you today?";
              sendResponse(service.responseText);

              service.requestText = "";
              sendRequest(service.requestText);

              service.haveTTS = false;
              service.isComplete = false;
              service.isInProgress = false;
              service.isListening = false;
              service.recognizing = false;

              service.speakState = 1;

              service.cancelTimer();
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

            ////////////////////////////////////

            service.resetConcierge = function() {
              resetVariables();
            };

            service.getAnswer = function(wsid, txt) {
              console.log('getAnswer() :: txt: ', txt);

              var deferred = $q.defer();

              var urlConversation = dbtApp.manifest.bluemixURL + "genii_conversation.php?workspaceId="+wsid+"&text=" + encodeURI(txt);

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

                    //dbtApp.currProductCategoryId = obj.productCategoryId;

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

            //// https://developers.google.com/web/updates/2014/01/Web-apps-that-talk-Introduction-to-the-Speech-Synthesis-API?hl=en
            //// https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#tts-section
            //// https://www.sitepoint.com/introducing-web-speech-api/
            //// https://www.npmjs.com/package/tts-speak
            //service.getSynthesis = function(txt) {
            //  console.log('getSynthesis() :: ');
            //
            //  var myRate = 1.5;
            //
            //  if(config.hardPlatform == 'ios') {
            //
            //    if (!config.deviceInformation.isVirtual) {
            //
            //      if (config.deviceInformation.version && config.deviceInformation.version.charAt(0) == '9') {
            //        myRate = 1.5;
            //      } else {
            //        myRate = 0.6;
            //      }
            //
            //    }
            //
            //  } else if(config.hardPlatform == 'android') {
            //    myRate = 1;
            //  }
            //
            //  TTS.speak({
            //    text: txt,
            //    locale: 'en-US',
            //    rate: myRate
            //  }, function () {
            //    console.log('Speech Finished');
            //  }, function (reason) {
            //    console.log('Speech Error: ', reason);
            //  });
            //};

            service.cancelTimer = function() {
              if(service.timer){
                $timeout.cancel( service.timer );
              }
            };

            ////////////////////////////////////

            var sendResponse = function(msg) {
              console.log('broadcast -> responseChange: ', msg);

              $rootScope.$broadcast('responseChange', {
                msg: msg
              });
            };

            var sendRequest = function(msg) {
              console.log('broadcast -> requestChange: ', msg);

              $rootScope.$broadcast('requestChange', {
                msg: msg
              });
            };

            ////////////////////////////////////

            return service;
        })
}());
