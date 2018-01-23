(function(){

    angular.module('ionicApp')

        .controller('MyListItemsAddCtrl', function($rootScope, $scope, $state, $timeout, $http, $stateParams, $ionicLoading, $ionicModal, dbtConcierge, dbtApp, dbtStorageService, dbtUtils) {

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

            ////////////////////////////////////

            //$ionicHistory.nextViewOptions({
            //  disableAnimate: true,
            //  disableBack: true
            //});

            var getLocation = function(id) {
              var categoryName = dbtStorageService.getCategoryName(id-1);
              console.log('categoryName: ', categoryName);

              dbtConcierge.getAnswer(categoryName).then(function(res) {
                vm.form.location = res;
              });
            };

            var dynamicSort = function(property) {
              var sortOrder = 1;
              if(property[0] === "-") {
                sortOrder = -1;
                property = property.substr(1);
              }
              return function (a,b) {
                var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                return result * sortOrder;
              }
            };

            var getCategories = function() {
                dbtStorageService.getCategories().then(function(res) {
                    if (res.rows.length > 0) {
                        for (var i = 0; i < res.rows.length; i++) {
                            if(res.rows.level2 != "0") {
                                vm.categories.push({
                                    id: res.rows.item(i).id,
                                    category_name: res.rows.item(i).category_name
                                });
                            }
                        }
                    }

                    console.log('getCategories() -> vm.categories: ', JSON.stringify(vm.categories));

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
                      list_item_location: res.rows.item(i).list_item_location
                    });
                  }
                }

                console.log('getListItems() -> vm.listItems: ', JSON.stringify(vm.listItems));

                $ionicLoading.hide();
              });
            };

            var showItemModal = function(itemObj) {
              //$ionicModal.fromTemplateUrl('states/mylists/mylistitem-modal.html', {
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
              dbtConcierge.getSynthesis(loc);
            };

            vm.productCategoryChange = function() {
              getLocation(vm.form.selCategory);
            };

            vm.addListItem = function() {
                formCompleted = true;

                showItemModal({'id': listItemId});
            };

            vm.insertListItem = function() {
                formCompleted = true;

                var myListItemId = listItemId;

                $scope.myModal.hide();

                var itemObj = {listId: myListItemId, categoryId: vm.form.selCategory, itemName: vm.form.itemName, descr: vm.form.descr, location: vm.form.location};
                console.log('itemObj: ', itemObj);

                dbtStorageService.insertItem(itemObj).then(function(result) {
                  var obj = {'id': result.insertId, 'category_id': vm.form.selCategory, 'list_item_name': vm.form.itemName, 'list_item_descr': vm.form.descr, 'list_item_location': vm.form.location};

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
