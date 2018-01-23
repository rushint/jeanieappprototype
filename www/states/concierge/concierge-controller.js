(function(){

    angular.module('ionicApp')

        .controller('ConciergeCtrl', function($rootScope, $scope, $state, $timeout, $http, $ionicModal, $q, dbtConversation, dbtStorageService, config, dbtUtils, dbtApp) {

            $scope.mediaRec;

            //vm.newFile = "new-audio-file-" + Math.floor(Date.now() / 1000) + ".wav";
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

            //var currStoreObj;

            var currStoreObj = dbtStorageService.getMyStoreLS();

            ////////////////////////////////////

            var vm = this;

            vm.isConnected = false;

            vm.currStore = currStoreObj.name;

            vm.initialPrompt = "What can I find for you today?";
            vm.textSpoken = "where is the popcorn";
            vm.speakState = 1;
            vm.dateSpoken = Date.now();
            vm.locationText = "The popcorn can be found in aisle 14 The popcorn can be found in aisle 14";
            vm.errorText = "";
            vm.comment = "";
            vm.useful = 0;
            vm.placeholder = "Enter your comments here.";
            vm.comments = "Your app helped me find my food just in time for movie night! Thanks Jeanie!";

            vm.currAnim = "";

            vm.isListening = false;
            vm.isUploading = false;
            vm.isComplete = true;
            vm.isAudioCaptured = false;
            vm.isInProgress = false;
            vm.haveSTT = false;
            vm.haveTTS = false;
            vm.locationFound = false;

            ////////////////////////////////////

            var playTone = function() {
                console.log('playTone()');

                $scope.mediaPlay = new Media("sounds/A-Tone-His_Self-1266414414.wav",
                    // success callback
                    function (resp) {
                        console.log('playTone success callback');

                        $scope.mediaPlay = null;
                    },

                    // error callback
                    function (err) {
                        console.log("playTone():Audio Error: " + err.code + " - " + err.message);

                        $scope.mediaPlay = null;
                    }
                );

                // Play audio
                $scope.mediaPlay.play();
            };

            var updateImage = function() {
                //console.log('updateImage() ', vm.speakState);
                if(vm.isListening) {

                    if (vm.speakState == 4) {
                        vm.speakState = 2;
                    } else if (vm.speakState == 3) {
                        vm.speakState = 4;
                    } else if (vm.speakState == 2) {
                        vm.speakState = 3;
                    } else if (vm.speakState == 1) {
                        vm.speakState = 2;
                    }
                    $timeout(function () {
                        updateImage();
                    }, 300);
                }
            };

            // https://developers.google.com/web/updates/2014/01/Web-apps-that-talk-Introduction-to-the-Speech-Synthesis-API?hl=en
            // https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#tts-section
            // https://www.sitepoint.com/introducing-web-speech-api/
            // https://www.npmjs.com/package/tts-speak
            var getSynthesis = function(txt) {
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

                    dbtUtils.trackEvent("error", "tts speech error", "concierge");
                });
            };

            var getAnswer = function(txt) {
                console.log('getAnswer() :: txt: ', txt);

                var urlConversation = dbtApp.manifest.bluemixURL + "genii_conversation.php?text=" + encodeURI(txt);
                //var urlConversation = "http://localhost/genii_conversation.php?text=" + encodeURI(txt);

                $http({
                    method: 'GET',
                    url: urlConversation
                }).then(
                    function success(resp) {
                        var response = resp;

                        console.log('response: ', JSON.stringify(response));

                        if(response.data.output) {
                            vm.locationText = response.data.output.text[0];

                            vm.initialPrompt = "What else can I find for you today?";
                            vm.isComplete = true;
                            vm.speakState = 1;
                            vm.isInProgress = false;
                            vm.haveTTS = true;

                            var ndx = vm.locationText.indexOf("I'm sorry");
                            if (ndx < 0) {
                                vm.locationFound = true;
                            } else {
                                vm.locationFound = false;
                            }

                            dbtConversation.responseText = vm.locationText;

                            dbtStorageService.setConversation(vm.textSpoken, vm.locationText, vm.useful, vm.comments);

                            dbtStorageService.inConversation = true;

                            $timeout(function () {
                                getSynthesis(vm.locationText);
                            }, 700);
                        } else {
                            vm.initialPrompt = "I was unable to fulfill your request. Please try again.";

                            vm.locationFound = false;
                            vm.speakState = 1;
                        }
                    },
                    function failure(resp) {
                        console.log('failure resp: ', JSON.stringify(resp));

                        vm.initialPrompt = "What else can I find for you today?";
                        vm.isComplete = true;
                        vm.speakState = 1;
                        vm.isInProgress = false;
                        vm.haveTTS = false;
                    }
                );
            };

            var uploadSuccess = function (r) {
                ft = null;
                vm.isAudioCaptured = false;
                vm.isInProgress = false;
                vm.isListening = false;
                vm.isUploading = false;

                var response = JSON.parse(r.response);

                $scope.$apply(function () {
                    console.log('response.results.length: ', response.results.length);

                    if(response.results.length > 0) {
                        vm.haveSTT = true;

                        vm.dateSpoken = Date.now();
                        vm.textSpoken = response.results[0].alternatives[0].transcript;
                        console.log('vm.textSpoken: ', vm.textSpoken);

                        vm.textSpoken = vm.textSpoken.replace("%HESITATION", "");

                        dbtConversation.questionText = vm.textSpoken;

                        // Phase II - Retrieve answer to question (IBM Watson Conversation)
                        getAnswer(vm.textSpoken);

                        getSynthesis("Searching");

                    } else {
                        vm.errorText = JSON.stringify(response);

                        vm.isAudioCaptured = false;
                        vm.isInProgress = false;
                        vm.isListening = false;
                        vm.isUploading = false;
                        vm.isComplete = true;
                        vm.haveSTT = false;
                        vm.speakState = 1;

                        vm.initialPrompt = "I'm sorry. I couldn't understand what you said. Could you please try again? What can I find for you today?";
                        vm.textSpoken = "";

                        dbtUtils.trackEvent("error", "no upload response", "concierge");

                        getSynthesis(vm.initialPrompt);
                    }
                //}, 200);
                });
            };

            var uploadFail = function (error) {
                $scope.$apply(function () {
                    ft = null;

                    vm.isInProgress = false;
                    vm.isListening = false;

                    vm.initialPrompt = "An error occured while processing your request. Could you please try again?";
                    getSynthesis(vm.initialPrompt);

                    vm.speakState = 1;

                    console.log("upload error source: " + error.source);
                    console.log("upload error target: " + error.target);
                });
            };

            function uploadAudio() {
                console.log('uploadAudio() :: ');

                // http://stackoverflow.com/questions/25198840/document-directory-path-of-ios-8-beta-simulator
                if (cordova.file.documentsDirectory) {
                    vm.directory = cordova.file.documentsDirectory;     // for iOS
                    vm.fullPath = vm.directory + fileName;
                } else {
                    vm.directory = cordova.file.externalDataDirectory;  // cordova.file.externalRootDirectory;  // for Android
                    vm.fullPath = vm.directory + fileName;
                }

                console.log('vm.fullPath: ', vm.fullPath);

                // Path and File on device
                vm.localURL = vm.directory.replace("file://", "") + fileName;

                // File on server
                var newFile = "genii-audio-file-" + Math.floor(Date.now() / 1000) + ".wav";

                var options = new FileUploadOptions();
                options.fileKey = "audio";
                options.fileName = newFile;
                options.mimeType = "audio/wav";
                options.chunkedMode = false;

                var ft = new FileTransfer();
                ft.upload(vm.localURL, encodeURI(baseURL), uploadSuccess, uploadFail, options);
            }

            var resetVariables = function() {
                vm.useful = 0;
                vm.locationText = 'Please wait ...';
                vm.textSpoken = "";

                vm.haveSTT = false;
                vm.haveTTS = false;
                vm.isComplete = false;
                vm.isInProgress = true;
                vm.isListening = true;

                vm.initialPrompt = "What can I find for you today?";
            };


            recorder.stop = function() {
                console.log('recorder.stop()');

                vm.isAudioCaptured = true;

                $scope.mediaRec.stopRecord();
            };

            recorder.record = function() {
                console.log('recorder.record()');

                var src = "documents://" + fileName;

                if(Media) {

                    $scope.mediaRec = new Media(src,
                        // success callback
                        function (resp) {
                            console.log('success callback');

                            $scope.mediaRec = null;

                            vm.isAudioCaptured = true;
                            vm.isListening = false;
                            vm.isAudioCaptured = true;
                            vm.isUploading = true;
                            vm.speakState = 5;

                            vm.initialPrompt = "Thank you. Please wait ...";

                            randSaying = Math.floor(Math.random()*((mySayings.length-1)-0+0)+0);
                            getSynthesis(mySayings[randSaying]);

                            // Phase I - Transcribe audio to text (IBM Watson Speech To Text)
                            uploadAudio();

                            //Play A-Tone-His_Self-1266414414.wav
                            playTone();
                        },

                        // error callback
                        function (err) {
                            console.log("recordAudio():Audio Error: " + err.code + " - " + err.message);

                            $scope.mediaRec = null;

                            vm.isAudioCaptured = false;
                            vm.isListening = false;
                            vm.isAudioCaptured = false;
                            vm.isUploading = false;
                            vm.speakState = 1;

                            dbtUtils.trackEvent("error", "media audio error", "concierge");

                            vm.initialPrompt = "I'm sorry. I wasn't able to fullfill your request. Could you please try again? What can I find for you today?";
                            getSynthesis("I'm sorry. I wasn't able to fullfill your request. Could you please try again?");
                        }
                    );

                    // Record audio
                    $scope.mediaRec.startRecord();

                    // Stop recording after 4 seconds
                    $timeout(function () {
                        if (!vm.isAudioCaptured && vm.isListening) {
                            console.log('Stopping recording due to timeout');

                            vm.isListening = false;

                            vm.speakState = 5;

                            recorder.stop();
                        }
                    }, 4000);
                } else {

                    // The Media object does not exist - app is not running on device
                    vm.locationText = "";
                    vm.textSpoken = "";

                    vm.haveSTT = false;
                    vm.haveTTS = false;
                    vm.isComplete = false;
                    vm.isInProgress = false;
                    vm.isListening = false;

                    vm.initialPrompt = "What can I find for you today?";

                    vm.speakState = 1;

                }
            };

            var init = function() {
                dbtUtils.trackView("concierge");

                dbtUtils.checkConnection().then(function(conn){
                  console.log(':: checkConnection() -> conn: ', conn);

                  if(conn == "No network connection") {
                      vm.isConnected = false;
                      vm.speakState = 5;

                      vm.initialPrompt = "I am not connected :(";

                      dbtUtils.trackEvent("error", "no network connection", "concierge");

                      dbtUtils.showErrorDialog("Jeanie Connectivity", "You must have connectivity to use Jeanie. Please activate to WiFi or a Cellular network and try again.");
                  } else {
                      vm.isConnected = true;
                  }
                }, function(err) {
                    console.log(':: checkConnection() -> err: ', err);

                    vm.isConnected = false;
                    vm.speakState = 2;

                    vm.initialPrompt = "I am not connected :(";

                    dbtUtils.trackEvent("error", "no network connection", "concierge");

                    dbtUtils.showErrorDialog("Jeanie Connectivity", "You must have connectivity to use Jeanie. Please activate to WiFi or a Cellular network and try again.");
                });
            };

            ////////////////////////////////////

            vm.closeMyStoreModal = function() {
                $scope.myModal.hide();
            }

            vm.showMyStoreModal = function() {
                var obj = {};

                vm.isModalOpen = true;

                $scope.detailObj = dbtStorageService.getMyStoreLS();

                $ionicModal.fromTemplateUrl('states/concierge/mystore-concierge-modal.html', {
                    scope: $scope,
                    animation: 'slide-in-down'
                }).then(function(modal) {
                    $scope.myModal = modal;

                    // Execute action on remove modal
                    $scope.$on('modal.hidden', function() {
                        console.log('Modal hidden');

                        vm.isModalOpen = false;
                    });

                    $scope.myModal.show();
                });
            }

            vm.closeResult = function(sel) {
                vm.useful = sel;

                dbtStorageService.insertConversation(vm.textSpoken, vm.locationText, dbtConversation.commentsText, vm.useful);

                if(!dbtStorageService.inConversation) {
                  resetVariables();
                }
            };

            vm.goComments = function() {
                $state.go('app.conciergecomments', {});
            };

            vm.goMap = function() {
                $state.go('app.conciergemap', {});
            };

            vm.chooseThumb = function(sel) {
                vm.useful = sel;
            };

            vm.closeModal = function() {
                $scope.myModal.hide();
            };

            vm.sayText = function(txt) {
                console.log('sayText() :: ');

                getSynthesis(txt);
            };

            vm.findProduct = function() {
                console.log('vm.findProduct() :: ');

                dbtUtils.trackEvent("tap", "find product", "concierge");

                resetVariables();

                vm.initialPrompt = "I'm listening ...";

                vm.speakState = 2;
                $timeout(function() {
                    updateImage();
                }, 300);

                recorder.record();
            };

            vm.stopSpeech = function() {
                if(!vm.isAudioCaptured && vm.isListening) {
                    console.log('vm.stopSpeech()');

                    vm.isListening = false;

                    vm.speakState = 5;

                    recorder.stop();
                }
            };

            init();

        })

}());
