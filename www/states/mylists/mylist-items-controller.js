(function(){

    angular.module('ionicApp')

        .controller('MyListItemsCtrl', function($rootScope, $scope, $state, $timeout, $http, $stateParams, $ionicLoading, $ionicModal, dbtApp, dbtSounds, dbtStorageService, dbtConciergeAndroid, config) {

            ////////////////////////////////////

            var vm = this;

            var db;
            var timeoutCnt = 0;
            var formCompleted = false;
            var listItemId = $stateParams.id;

            vm.listItems = [];
            vm.categories = [];
            vm.form = {};
            vm.form.selCategory = "";
            vm.form.itemName = "";
            vm.form.descr = "";
            vm.form.location = "";

            vm.currListName = dbtApp.currListName;

            vm.haveAnswer = false;

            ////////////////////////////////////

            //$ionicHistory.nextViewOptions({
            //  disableAnimate: true,
            //  disableBack: true
            //});

            var getLocation = function(catName) {
              //var categoryName = dbtStorageService.getCategoryName(id-1);
              console.log('catName: ', catName);

              var currStoreObj = dbtStorageService.getMyStoreLS();

              if(config.isIOS) {
                //dbtConciergeIOS.getAnswer(currStoreObj.workspaceId, catName).then(function(res) {
                //  vm.haveAnswer = true;
                //
                //  var ndx = res.indexOf("sorry");
                //  if (ndx < 0) {
                //    vm.form.location = res;
                //
                //    dbtSounds.getSynthesis(res);
                //  } else {
                //    vm.form.location = "I'm sorry. I wasn't able to find that location";
                //  }
                //});
              } else if(config.isAndroid) {
                dbtConciergeAndroid.getAnswer(currStoreObj.workspaceId, catName).then(function(res) {
                  vm.haveAnswer = true;

                  var ndx = res.indexOf("sorry");
                  if (ndx < 0) {
                    vm.form.location = res;

                    dbtSounds.getSynthesis(res);
                  } else {
                    vm.form.location = "I'm sorry. I wasn't able to find that location";
                  }
                });
              } else {
                dbtConciergeAndroid.getAnswer(currStoreObj.workspaceId, catName).then(function(res) {
                  vm.haveAnswer = true;

                  var ndx = res.indexOf("sorry");
                  if (ndx < 0) {
                    vm.form.location = res;

                    dbtSounds.getSynthesis(res);
                  } else {
                    vm.form.location = "I'm sorry. I wasn't able to find that location";
                  }
                });
              }
            };

          // sorts an array of objects according to one field
          // call like this: sortObjArray(myArray, "name" );
          // it will modify the input array
          var sortObjArray = function(arr, field) {
            arr.sort(
              function compare(a,b) {
                if (a[field] < b[field])
                  return -1;
                if (a[field] > b[field])
                  return 1;
                return 0;
              }
            );
          };

          // call like this: uniqueDishes = removeDuplicatesFromObjArray(dishes, "dishName");
          // it will NOT modify the input array
          // input array MUST be sorted by the same field (asc or desc doesn't matter)
          var removeDuplicatesFromObjArray = function(arr, field) {
            var u = [];
            arr.reduce(function (a, b) {
              if (a[field] !== b[field]) u.push(b);
              return b;
            }, []);
            return u;
          };

            var getCategories = function() {
                dbtStorageService.getCategories().then(function(res) {
                    if (res.rows.length > 0) {
                        for (var i = 0; i < res.rows.length; i++) {
                            vm.categories.push({
                                id: res.rows.item(i).id,
                                category_name: res.rows.item(i).category_name
                            });
                        }

                        sortObjArray(vm.categories, "category_name");

                        vm.categories = removeDuplicatesFromObjArray(vm.categories, "category_name");
                    }

                  //console.log('getCategories() -> vm.categories: ', JSON.stringify(vm.categories));

                  $ionicLoading.hide();
                });
            };

            var getListItems = function(id) {
              dbtStorageService.getListItems(id).then(function(res) {
                if (res.rows.length > 0) {
                  for (var i = 0; i < res.rows.length; i++) {
                    vm.listItems.push({
                      id: res.rows.item(i).id,
                      category_id: res.rows.item(i).category_id,
                      list_item_name: res.rows.item(i).list_item_name,
                      list_item_descr: res.rows.item(i).list_item_descr,
                      list_item_location: res.rows.item(i).list_item_location,
                      completed: res.rows.item(i).completed
                    });
                  }
                }

                console.log('getListItems() -> vm.listItems: ', JSON.stringify(vm.listItems));

                $ionicLoading.hide();
              });
            };

            var showItemModal = function(itemObj) {
              $ionicModal.fromTemplateUrl('states/sharedmodals/mylistItem-modal.html', {
                scope: $scope,
                animation: 'slide-in-down'
              }).then(function(modal) {
                $scope.myModal = modal;

                console.log('mylistitem-modal.html Ready');
                $scope.myModal.show();

                // Execute action on remove modal
                $scope.$on('modal.hidden', function() {
                  console.log('Modal hidden');
                })
              });
            };

            var init = function() {
              $ionicLoading.show({
                template: 'Loading...'
              }).then(function(){
                console.log("The loading indicator is now displayed");
              });

              getListItems(listItemId);

              getCategories();
            };

            ////////////////////////////////////

            vm.speakLocation = function(loc) {
              if(loc != ""){
                dbtSounds.getSynthesis(loc);
              }

              return false;
            };

            vm.checkItem = function(obj) {
              console.log('checkItem()');

              var myObj = obj;

              dbtStorageService.updateItemComplete(obj.id, 1).then(function(result) {
                myObj.completed = 1
              });
            };

            vm.uncheckItem = function(obj) {
              console.log('uncheckItem()');

              var myObj = obj;

              dbtStorageService.updateItemComplete(obj.id, 0).then(function(result) {
                myObj.completed = 0
              });
            };

            vm.productCategoryChange = function() {
              var catName;

              for(var i = 0; i < vm.categories.length; i++){
                if(vm.categories[i].id == vm.form.selCategory) {
                  catName = vm.categories[i].category_name;

                  break;
                }
              }

              getLocation(catName);
            };

            vm.addListItem = function() {
                formCompleted = true;

                showItemModal({'id': listItemId});
            };

            vm.insertListItem = function() {
                formCompleted = true;

                var myListItemId = listItemId;

                $scope.myModal.hide();

                var itemObj = {listId: myListItemId, categoryId: vm.form.selCategory, itemName: vm.form.itemName, descr: vm.form.descr, location: vm.form.location, completed: 0};
                console.log('itemObj: ', itemObj);

                dbtStorageService.insertItem(itemObj).then(function(result) {
                  var obj = {'id': result.insertId, 'category_id': vm.form.selCategory, 'list_item_name': vm.form.itemName, 'list_item_descr': vm.form.descr, 'list_item_location': vm.form.location, 'completed': '0'};

                  vm.listItems.splice(0, 0, obj);
                });
            };

            vm.deleteListItem = function(itemObj, ndx) {
              var myNdx = ndx;

              dbtStorageService.deleteListItem(itemObj.id).then(function(result) {
                if(result) {
                  var removedListItem = vm.listItems.splice(myNdx, 1);
                }
              });
            };

            vm.closeModal = function() {
                formCompleted = false;

                $scope.myModal.hide();
            };

            ////////////////////////////////////

            init();

        })

}());
