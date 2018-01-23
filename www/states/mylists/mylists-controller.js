(function(){

    angular.module('ionicApp')

        .controller('MyListsCtrl', function($rootScope, $scope, $state, $timeout, $http, $ionicPlatform, $ionicLoading, $cordovaSQLite, $ionicPopup, $ionicModal, dbtApp, dbtStorageService, dbtUtils) {

            ////////////////////////////////////

            var vm = this;

            var db;
            var timeoutCnt = 0;

            vm.lists = [];

            ////////////////////////////////////

            //$ionicHistory.nextViewOptions({
            //  disableAnimate: true,
            //  disableBack: true
            //});

            var getLists = function() {
              dbtStorageService.getLists().then(function(res) {
                if (res.rows.length > 0) {
                  for (var i = 0; i < res.rows.length; i++) {
                    vm.lists.push({
                      id: res.rows.item(i).id,
                      list_name: res.rows.item(i).list_name,
                      numitems: res.rows.item(i).numitems
                    });
                  }
                }

                console.log('getLists() -> vm.lists: ', JSON.stringify(vm.lists));

                $ionicLoading.hide();
              });
            };

            var getDataWhenReady = function() {
              console.log('getDataWhenReady()');

              if(dbtStorageService.dbReady) {
                console.log('data ready ...');

                getLists();
              } else if(timeoutCnt > 6) {
                dbtUtils.showErrorDialog("Jeanie says ...", "A system error has occurred. Please contact us so we can help you with this issue.");
              } else {
                timeoutCnt++;
                $timeout(function() {
                  getDataWhenReady();
                }, 500)
              }
            };

            var init = function() {
                getDataWhenReady();
            };

            ////////////////////////////////////

            vm.deleteList = function(list) {
              var query = "DELETE FROM tblLists where id = ?";
              $cordovaSQLite.execute(db, query, [list.id]).then(function(res) {
                $scope.items.splice(vm.lists.indexOf(list), 1);
              }, function (err) {
                console.error(err);
              });
            };

            vm.addList = function() {
              $ionicPopup.prompt({
                  title: 'Enter a new list',
                  inputType: 'text'
                })
                .then(function(listName) {
                  if(listName !== undefined && listName != "") {
                    var myListName = listName;

                    dbtStorageService.insertList(myListName).then(function(result) {
                      console.log('result: ', result);

                      var obj = {'id': result.insertId, 'list_name': myListName};

                      vm.lists.splice(0, 0, obj);
                    });
                  } else {
                    console.log("Action Cancelled");
                  }
                });
            };

            vm.goList = function(listObj) {
              console.log('goList()');

              dbtApp.currListName = listObj.list_name;

              $state.go('app.mylistitems', {'id': listObj.id});
            };

            vm.removeList = function(listObj, ndx) {
              console.log('removeList() -> listObj: ', listObj, ndx);

              var myNdx = ndx;

              dbtUtils.showDialogAndWait("Jeanie asks ...", "Are you sure you want to delete this list?").then(function(res) {
                  if(res) {
                      dbtStorageService.deleteList(listObj.id).then(function (result) {
                          if (result) {
                              var removedList = vm.lists.splice(myNdx, 1);
                          }
                      });
                  }
              });

            };

            ////////////////////////////////////

            init();

        })

}());
