(function(){

    angular.module('ionicApp')

        .factory('dbtSounds', function($q, config) {

            var mediaPlay = new Object();

            var isTTS = function() {
                if(typeof TTS !== "undefined") {
                    return true;
                } else {
                  return false;
                }
            };

            var isMedia = function() {
              if(typeof Media !== "undefined") {
                return true;
              } else {
                return false;
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

              if(isTTS()) {
                  TTS.speak({
                    text: txt,
                    locale: 'en-US',
                    rate: myRate
                  }, function () {
                    console.log('Speech Finished');
                  }, function (reason) {
                    console.log('Speech Error: ', reason);
                  });
              } else {
                  console.log("TTS is not available");
              }
            };

            var playTone = function() {
              console.log('playTone()');

              if(isMedia()) {
                  mediaPlay = new Media("sounds/A-Tone-His_Self-1266414414.wav",
                    // success callback
                    function (resp) {
                      console.log('playTone success callback');

                      mediaPlay = null;
                    },

                    // error callback
                    function (err) {
                      console.log("playTone():Audio Error: " + err.code + " - " + err.message);

                      mediaPlay = null;
                    }
                  );

                  // Play audio
                  mediaPlay.play();
              } else {
                  console.log("MEDIA is not available");
              }
            };

            var deleteSound = function(x) {
                console.log("calling deleteSound");

                var deferred = $q.defer();
                getSounds().then(function(sounds) {
                    sounds.splice(x,1);
                    localStorage.mysoundboard = JSON.stringify(sounds);
                    deferred.resolve();
                });

                return deferred.promise;

            }

            var getSounds = function() {
                var deferred = $q.defer();
                var sounds = [];

                if(localStorage.mysoundboard) {
                    sounds = JSON.parse(localStorage.mysoundboard);
                }
                deferred.resolve(sounds);

                return deferred.promise;
            }

            var playSound = function(x) {
                getSounds().then(function(sounds) {
                    var sound = sounds[x];

                    /*
                     Ok, so on Android, we just work.
                     On iOS, we need to rewrite to ../Library/NoCloud/FILE'
                     */
                    var mediaUrl = sound.file;
                    if(device.platform.indexOf("iOS") >= 0) {
                        mediaUrl = "../Library/NoCloud/" + mediaUrl.split("/").pop();
                    }
                    var media = new Media(mediaUrl, function(e) {
                        media.release();
                    }, function(err) {
                        console.log("media err", err);
                    });
                    media.play();
                });
            }

            var saveSound = function(s) {
                console.log("calling saveSound");

                var deferred = $q.defer();
                getSounds().then(function(sounds) {
                    sounds.push(s);
                    localStorage.mysoundboard = JSON.stringify(sounds);
                    deferred.resolve();
                });

                return deferred.promise;
            }

            return {
                getSynthesis: getSynthesis,
                playTone: playTone,
                isTTS: isTTS,
                get: getSounds,
                save: saveSound,
                delete: deleteSound,
                play: playSound
            };
        });

}());
