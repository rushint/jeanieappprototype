(function(){

    angular.module('ionicApp')

        .controller('TestCtrl', function($rootScope, $scope, $state, $q, $http, $cordovaFile, $cordovaFileTransfer, $timeout, $ionicLoading, $http, config) {

            var vm = this;

            vm.myconfig = null;

            vm.btnState = "Record Audio";
            vm.isComplete = true;
            vm.isInProgress = false;
            vm.isInserting = false;

            //vm.myText = "The raisins can be found in the middle of aisle 23.";
            vm.myText = "The candy can be found in aisle 20.";

            var mySayings = [
              "Thank you. Please wait.",
              "OK. Hold on.",
              "Thanks. Please wait.",
              "OK. Please wait.",
              "Thanks. Hold on."
            ];

            var randSaying;

            // https://developers.google.com/web/updates/2014/01/Web-apps-that-talk-Introduction-to-the-Speech-Synthesis-API?hl=en
            // https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#tts-section
            // https://www.sitepoint.com/introducing-web-speech-api/
            function getSpeech(myText) {
                console.log('getSpeech() :: ');

                var myRate = 1.5;

                if (!config.deviceInformation.isVirtual) {

                    if(config.hardPlatform == 'ios') {

                        if (config.deviceInformation.version.charAt(0) == '9') {
                            myRate = 1.5;
                        } else {
                            myRate = 0.6;
                        }
                    }
                } else {
                    myRate = 1.5;
                }

                //if(config.isDeviceBuild){
                //    myRate = 0.6;
                //}

                TTS.speak({
                        text: myText,
                        locale: 'en-US',
                        rate: myRate
                    }, function () {
                        vm.isInProgress = false;
                        $scope.$apply();
                    }, function (reason) {
                        alert(reason);
                    });

                //var msg = new SpeechSynthesisUtterance(vm.myText);
                //
                //var voices = window.speechSynthesis.getVoices();
                //voices.forEach(function(voice) {
                //    console.log(voice.name, voice.default ? '(default)' :'');
                //});
                //
                //if(config.isDeviceBuild){
                //    msg.rate = 0.1; // 0.1 to 10
                //}
                //
                //msg.lang = 'en-US';
                //
                //speechSynthesis.speak(msg);
                //
                //msg.onend = function(e) {
                //    $scope.$apply(function () {
                //        console.log('Finished in ' + event.elapsedTime + ' seconds.');
                //
                //        vm.isInProgress = false;
                //    });
                //};

                //var msg = new SpeechSynthesisUtterance();
                //var voices = window.speechSynthesis.getVoices();
                //
                //voices.forEach(function(voice) {
                //    console.log(voice.name, voice.default ? '(default)' :'');
                //});

                //msg.voice = voices[8]; // Note: some voices don't support altering params
                //msg.voiceURI = 'native';
                //msg.volume = 1; // 0 to 1
                //msg.rate = 0.1; // 0.1 to 10
                //msg.pitch = 1; //0 to 2
                ////msg.text = vm.myText;
                //msg.lang = 'en-US';

                //speechSynthesis.speak(msg);
                //
                //msg.onend = function(e) {
                //    console.log('Finished in ' + event.elapsedTime + ' seconds.');
                //};
            }

            vm.submitText = function() {
                if(!vm.isInProgress && vm.myText.length > 0) {
                    vm.isInProgress = true;

                    getSpeech(vm.myText);
                }
            };

            vm.testSaying = function() {
                randSaying = Math.floor(Math.random()*(4-0+0)+0);
                console.log('randSaying: ', randSaying);

                getSpeech(mySayings[randSaying]);
            }

            var insertConversation = function(utter, answ, comment, useful) {
                console.log('insertConversation()');

                // dbtApp.manifest.baseURL + postConversation.php?utter=where%20is%20the%20candy&answ=Your%20candy%20is%20right%20here&comment=WoW!%20I%20love%20this%20app!&useful=1
                var urlConversation = dbtApp.manifest.baseURL + "postConversation.php?utter=" + encodeURI(utter) + "&answ=" + encodeURI(answ) + "&comment=" + encodeURI(comment) + "&useful=" + useful;

                console.log('urlConversation: ', urlConversation);

                $http({
                    method: 'GET',
                    url: urlConversation
                }).then(
                    function success(resp) {
                        var response = resp;

                        console.log('response: ', JSON.stringify(response));

                        vm.isInserting = false;
                    },
                    function failure(resp) {
                        console.log('failure resp: ', JSON.stringify(resp));

                        vm.isInserting = false;
                    }
                );
            };

            vm.saveConversation = function() {
                console.log('saveConversation()');

                vm.isInserting = true;

                var utter = "where is the candy";
                var answ = "Your candy is right here";
                var comment = "WoW! I love this app!";
                var useful = 1;

                insertConversation(utter, answ, comment, useful);
            };

            function init() {
                console.log('init() :: config: ', JSON.stringify(config));

                vm.myconfig = config;
            }

            init();
        })

}());
