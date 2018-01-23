(function(){
    angular
        .module('ionicApp')

        .factory('dbtConversation', function($timeout, $q, $http, dbtStorageService, dbtSounds, dbtApp) {
            var service = {};

            var currStoreObj = dbtStorageService.getMyStoreLS();

            service.questionText = "where is the popcorn";
            service.responseText = "The popcorn can be found in aisle 12";
            service.useful = "0";
            service.commentsText = "";

          service.getAnswer = function(wsid, txt) {
            console.log('getAnswer() :: txt: ', txt);

            var deferred = $q.defer();

            var urlConversation = dbtApp.manifest.bluemixURL + "genii_conversation.php?workspaceId="+wsid+"&text=" + encodeURI(txt);

            $http({
              method: 'GET',
              url: urlConversation
            }).then(
              function success(resp) {
                var response = resp;

                console.log('response: ', JSON.stringify(response));

                if(response.data.output) {
                  var answer = response.data.output.text[0];

                  var ndx = answer.indexOf("I'm sorry");
                  if (ndx < 0) {
                    $timeout(function () {
                      dbtSounds.getSynthesis(answer);
                    }, 700);

                    if(response.data.output.hasOwnProperty('id')) {
                      dbtApp.currProductCategoryId = response.data.output.id;
                    } else {
                      dbtApp.currProductCategoryId = "000";
                    }

                    deferred.resolve(answer);
                    //dbtApp.currResponse = answer;
                  }
                } else {
                  answer = "I was unable to fulfill your request. Please try again.";

                  deferred.resolve(answer);
                  //dbtApp.currResponse = answer;
                }
              },
              function failure(resp) {
                console.log('failure resp: ', JSON.stringify(resp));

                deferred.reject(resp);
                //dbtApp.currResponse = answer;
              }
            );

            return deferred.promise;
          };

            return service;
        })
}());
