(function(){
  angular
    .module('ionicApp')

    .factory('dbtUtils', function ($ionicLoading, $q, $cordovaFile, $timeout, $ionicPopup, $q, $http, $ionicPlatform, config) {
      /* jshint ignore:start */

      var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

      var networkStates = {};

      function formatBytes(bytes, decimals) {
        if(bytes == 0) return '0 Byte';

        var k = 1000;
        var dm = decimals + 1 || 1;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat(Math.round((bytes / Math.pow(k, i))).toFixed(dm)) + ' ' + sizes[i];
      }

      return {
        connectionState: 1,

        trackView: function(view) {
            //if(typeof analytics !== undefined) {
            //    analytics.trackView(view);
            //}
        },

        trackEvent: function(cat, action, label) {
            //if(typeof analytics !== undefined) {
            //    analytics.trackEvent(cat, action, label);
            //}
        },

        pad: function(n, width, z) {
            z = z || '0';
            n = n + '';

            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        },

        getRemoteFileSize : function(link) {
          var deferred = $q.defer();

          $http({
            method: 'HEAD',
            url: link,
            headers: {
              'Authorization': undefined
            },
            cache: true
          }).then(
            function success(resp, status, headers, config) {
              console.log('Content-Length: ' + resp.headers('Content-Length'));

              var contentLength = resp.headers('Content-Length');

              if(contentLength) {
                var fileSize = formatBytes(contentLength, 1);
              } else {
                fileSize = null;
              }

              deferred.resolve(fileSize);
            },
            function failure(resp, status, headers, config) {
              deferred.reject(resp);
            }
          );

          return deferred.promise;
        },
        encode : function (input) {
          var output = "";
          var chr1, chr2, chr3 = "";
          var enc1, enc2, enc3, enc4 = "";
          var i = 0;

          do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
              enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
              enc4 = 64;
            }

            output = output +
              keyStr.charAt(enc1) +
              keyStr.charAt(enc2) +
              keyStr.charAt(enc3) +
              keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
          } while (i < input.length);

          return output;
        },

        decode: function (input) {
          var output = "";
          var chr1, chr2, chr3 = "";
          var enc1, enc2, enc3, enc4 = "";
          var i = 0;

          // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
          var base64test = /[^A-Za-z0-9\+\/\=]/g;
          if (base64test.exec(input)) {
            window.alert("There were invalid base64 characters in the input text.\n" +
              "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
              "Expect errors in decoding.");
          }
          input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

          do {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
              output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
              output = output + String.fromCharCode(chr3);
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

          } while (i < input.length);

          return output;
        },

        // Changes XML to JSON
        xmlToJson: function (xml) {

          // Create the return object
          var obj = {};

          if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
              obj["@attributes"] = {};
              for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
              }
            }
          } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
          }

          // do children
          if (xml.hasChildNodes()) {
            for(var i = 0; i < xml.childNodes.length; i++) {
              var item = xml.childNodes.item(i);
              var nodeName = item.nodeName;
              if (typeof(obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
              } else {
                if (typeof(obj[nodeName].push) == "undefined") {
                  var old = obj[nodeName];
                  obj[nodeName] = [];
                  obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
              }
            }
          }

          return obj;
        },

        showActivity : function(msg) {
          $ionicLoading.show({
            template: msg
          });
        },

        hideActivity : function(){
          $ionicLoading.hide();
        },

        showError : function(msg) {
          var deferred = $q.defer();

          $ionicLoading.show({
            //template: msg,
            template: "<div class='loading-text'>" +
            "<p>" + msg + "</p>" +
            "</div>"
          });

          $timeout(function() {
            deferred.resolve(true);

            $ionicLoading.hide();
          }, 5000);

          return deferred.promise;
        },

        showErrorDialog : function(title, msg) {
            $ionicPopup.alert({
                title: title,
                template: msg
            });
        },

        showAlertAndWait : function(title, msg) {
          var deferred = $q.defer();

          var alertPopup = $ionicPopup.alert({
            title: title,
            template: msg
          });

          alertPopup.then(function(res) {
            deferred.resolve(true);
          });

          return deferred.promise;
        },

        showDialogAndWait : function(title, msg) {
          var deferred = $q.defer();

          var confirmPopup = $ionicPopup.confirm({
            title: title,
            template: msg
          });

          confirmPopup.then(function(res) {
              deferred.resolve(res);
          });

          return deferred.promise;
        },

        checkConnection : function() {
          console.log('checkConnection()');

          var deferred = $q.defer();

          if (navigator.connection) {
              var networkState = navigator.connection.type;
console.log('networkState: ', networkState);
              //networkStates[Connection.UNKNOWN] = 'Unknown connection';
              //networkStates[Connection.ETHERNET] = 'Ethernet connection';
              //networkStates[Connection.WIFI] = 'WiFi connection';
              //networkStates[Connection.CELL_2G] = 'Cell 2G connection';
              //networkStates[Connection.CELL_3G] = 'Cell 3G connection';
              //networkStates[Connection.CELL_4G] = 'Cell 4G connection';
              //networkStates[Connection.CELL] = 'Cell generic connection';
              //networkStates[Connection.NONE] = 'No network connection';
              //
              //console.log(":: Connection -> ", networkStates[networkState]);
              //
              //deferred.resolve(networkStates[networkState]);
            deferred.resolve(networkState);
          } else {
              console.log(":: No Connection");

              deferred.resolve('None');
          }

          return deferred.promise;
        },

        checkMedia : function() {
            var testMedia = new Media("test.wav",
                function (resp) {
                    console.log('checkMedia() :: success callback');
                },
                function (err) {
                    console.log("checkMedia() :: Media Error: " + err.code + " - " + err.message);
                }
            );
        },

        setOffLine : function() {
          //appConfig.connectionType = 'None';
        },

        getFreeDiskSpace : function() {
          var deferred = $q.defer();

          $cordovaFile.getFreeDiskSpace()
            .then(function (success) {
              // success in kilobytes
              deferred.resolve(success);
            }, function (error) {
              // error
              deferred.resolve(error);
            });

          return deferred.promise;
        }
      };
      /* jshint ignore:end */
    });
}());
