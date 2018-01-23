(function(){

    angular.module('ionicApp')

        .controller('ConciergeCommentsCtrl', function($rootScope, $scope, $state, $timeout, $http, $ionicLoading, dbtConversation, dbtApp, config) {


            ////////////////////////////////////

            var vm = this;

            vm.requestText = "";
            vm.responseText = "";
            vm.comments = "";

            ////////////////////////////////////

            var insertConversation = function(utter, answ, comment, useful) {
                console.log('insertConversation()');

                console.log('dbtConversation: ', dbtConversation);

                var urlConversation = dbtApp.manifest.baseURL + "postConversation.php?utter=" + encodeURI(utter) + "&answ=" + encodeURI(answ) + "&comment=" + encodeURI(comment) + "&useful=" + useful;

                console.log('urlConversation: ', urlConversation);

                $http({
                    method: 'GET',
                    url: urlConversation
                }).then(
                    function success(resp) {
                        var response = resp;

                        console.log('response: ', JSON.stringify(response));

                        $ionicLoading.show({
                            template: 'Thank you for your comments'
                        });

                        $timeout(function(){
                            $ionicLoading.hide();

                            $state.go('app.concierge', {});
                        }, 2000);
                    },
                    function failure(resp) {
                        console.log('failure resp: ', JSON.stringify(resp));
                    }
                );
            };

            var init = function() {
                vm.requestText = dbtConversation.questionText;
                vm.responseText = dbtConversation.responseText;
            };

            ////////////////////////////////////

            vm.saveComments = function() {
                console.log('saveComments()');

                dbtConversation.commentsText = vm.comments;

                if(dbtConversation.commentsText.length < 1){
                    comment = "";
                }

                if(dbtConversation.useful != 1 && dbtConversation.useful != -1){
                    dbtConversation.useful = 0;
                }

                insertConversation(dbtConversation.questionText, dbtConversation.responseText, dbtConversation.commentsText, dbtConversation.useful);
            }

            ////////////////////////////////////

            init();

        })

}());
