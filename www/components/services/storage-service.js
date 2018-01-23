(function(){
  angular
    .module('ionicApp')

    .factory('dbtStorageService', function($rootScope, $q, $timeout, $http, $cordovaSQLite, dbtApp) {
      var service = {};

      var conversation = {
          request: "",
          response: "",
          useful: 0,
          comments: ""
      };

      var categories = [];

      var categoriesInsert = [];

      var resetSQL = [
        'DROP TABLE IF EXISTS tblCategories',
        'DROP TABLE IF EXISTS tblLists',
        'DROP TABLE IF EXISTS tblListItems'
      ];

      var jeanieDBSQL = [
        'CREATE TABLE IF NOT EXISTS tblCategories (id integer primary key, category_name text)',
        'CREATE TABLE IF NOT EXISTS tblLists (id integer primary key, list_name text)',
        'CREATE TABLE IF NOT EXISTS tblListItems (id integer primary key, list_id integer, category_id integer, list_item_name text, list_item_descr text, list_item_location text, completed integer)'
      ];

      var sqlDB;

      service.dbReady = false;

      service.myStore = null;

      service.inConversation = false;

      service.setConversation = function(request, response, useful, comments) {
          conversation.request = request;
          conversation.response = response;
          conversation.useful = useful;
          conversation.comments = comments;
      };

      service.getCategoryName = function(id) {
        return categories[id];
      };

      var populateCategoriesInsert = function(categories) {
        var insertArr = [];

        console.log('- populateCategoriesInsert() -> categories: ', categories);

        for(var i = 0; i < categories.length; i++) {
          insertArr = [ 'INSERT INTO tblCategories (category_name) VALUES (?)', [categories[i]] ];

          categoriesInsert.push(insertArr);
        }

        console.log('- populateCategoriesInsert() -> categoriesInsert: ', categoriesInsert);

      };

      ///////////////////////////////////
      /* SQLite */
      ///////////////////////////////////
      service.initJeanieDBDevice = function(reset) {
        $http.get('data/categories.json').success(function(data) {
          var sqlBatch = [];

          categories = data;

          populateCategoriesInsert(data);

          console.log('- Reset DB on Device: ', reset);

          if(reset) {
            sqlBatch = angular.copy(resetSQL.concat(jeanieDBSQL).concat(categoriesInsert));
          } else {
              sqlBatch = angular.copy(jeanieDBSQL.concat(categoriesInsert));
          }

          console.log("- initJeanieDBDevice() -> sqlBatch:", sqlBatch);

          window.sqlitePlugin.openDatabase({ name: 'jeanie-lists.db', location: 'default' }, function (db) {
              sqlDB = db;

              sqlDB.sqlBatch(sqlBatch, function () {
                  console.log('initJeanieDB success');

                  sqlDB.transaction(function (tx) {
                      tx.executeSql('SELECT * FROM tblCategories', [], function (tx, resultSet) {
                          if(resultSet.rows.length < 1) {
                              for(var i = 0; i < categories.length; i++) {
                                  tx.executeSql("INSERT INTO tblCategories (category_name) VALUES (?)", [categories[i]]);
                              }
                          }

                          service.dbReady = true;
                      });
                  });

              }, function (error) {
                  console.log('initJeanieDB error: ' + JSON.stringify(error.message));
              });
          });
        });
      };

      service.initJeanieDBWeb = function(reset) {
        $http.get('data/categories.json').success(function(data) {
          categories = data;

          populateCategoriesInsert(data);

          if (!window.cordova) {
            sqlDB = openDatabase("data/webmylists.db", '1.0', "Jeanie WebSQL Database", 2 * 1024 * 1024);
            sqlDB.transaction(function (tx) {
              if(reset) {
                tx.executeSql("DROP TABLE IF EXISTS tblCategories");
                tx.executeSql("DROP TABLE IF EXISTS tblLists");
                tx.executeSql("DROP TABLE IF EXISTS tblListItems");
              }

              tx.executeSql("CREATE TABLE IF NOT EXISTS tblCategories (id integer primary key, category_name text)");
              tx.executeSql("CREATE TABLE IF NOT EXISTS tblLists (id integer primary key, list_name text)");
              tx.executeSql("CREATE TABLE IF NOT EXISTS tblListItems (id integer primary key, list_id integer, category_id integer, list_item_name text, list_item_descr text, list_item_location text, completed)");

              tx.executeSql('SELECT * FROM tblCategories', [], function (tx, resultSet) {
                if(resultSet.rows.length < 1) {
                  for(var i = 0; i < categories.length; i++) {
                    tx.executeSql("INSERT INTO tblCategories (category_name) VALUES (?)", [categories[i]]);
                  }
                }
              });

              service.dbReady = true;
            });
          }
        });
      };

      service.getCategories = function() {
          console.log('service.getCategories()');

          var deferred = $q.defer();

          sqlDB.transaction(function (tx) {
              tx.executeSql('SELECT * FROM tblCategories ORDER BY category_name', [], function (tx, resultSet) {
                  console.log("getCategories() -> resultSet: ", resultSet);

                  deferred.resolve(resultSet);
              });
          });


          return deferred.promise;
      };

      service.getLists = function() {
        console.log('service.getLists()');

        var deferred = $q.defer();

        sqlDB.transaction(function (tx) {
          //tx.executeSql('SELECT * FROM tblLists ORDER BY id DESC', [], function (tx, resultSet) {
          tx.executeSql('SELECT L.*, COUNT(I.id) AS numitems FROM tblLists AS L LEFT JOIN tblListItems I ON L.id = I.list_id GROUP BY L.id', [], function (tx, resultSet) {
            console.log('resultSet: ', resultSet);
            deferred.resolve(resultSet);
          }, function(tx, error) {
            console.log('error: ', error);
          });
        });

        return deferred.promise;
      };

      service.getListItems = function(id) {
        console.log('service.getListItems() -> id: ', id);

        var deferred = $q.defer();

        sqlDB.transaction(function (tx) {
          tx.executeSql('SELECT * FROM tblListItems WHERE list_id = ?', [id], function (tx, resultSet) {
            deferred.resolve(resultSet);
          });
        });

        return deferred.promise;
      };

      service.insertList = function(listName) {
        console.log('service.insertList()');

        var deferred = $q.defer();

        sqlDB.transaction(function (tx) {
          tx.executeSql('INSERT INTO tblLists (list_name) VALUES (?)', [listName], function (tx, resultSet) {
            deferred.resolve(resultSet);    // resultSet.insertId and resultSet.rowsAffected
          });
        });

        return deferred.promise;
      };

      service.deleteList = function(listId) {
          console.log('service.deleteList()');

          var deferred = $q.defer();

          var myListId = listId;

          sqlDB.transaction(function (tx) {
              tx.executeSql('DELETE FROM tblListItems WHERE list_id = ?', [myListId], function (tx, resultSet) {
                  tx.executeSql('DELETE FROM tblLists WHERE id = ?', [myListId], function (tx, resultSet) {
                      deferred.resolve(resultSet);    // resultSet.insertId and resultSet.rowsAffected
                  });
              });
          });

          return deferred.promise;
      };

      service.insertItem = function(itemObj) {
        console.log('service.insertItem()');

        var deferred = $q.defer();

        var myItemObj = itemObj;

        sqlDB.transaction(function (tx) {
          tx.executeSql('INSERT INTO tblListItems (list_id, category_id, list_item_name, list_item_descr, list_item_location, completed) VALUES (?, ?, ?, ?, ?, ?)', [myItemObj.listId, myItemObj.categoryId, myItemObj.itemName, myItemObj.descr, myItemObj.location, myItemObj.completed], function (tx, resultSet) {
            deferred.resolve(resultSet);    // resultSet.insertId and resultSet.rowsAffected
          },
          function (tx, error) {
            console.log('INSERT error: ' + error);

            deferred.reject(error);
          });
        });

        return deferred.promise;
      };

      service.updateItemComplete = function(id, val) {
        console.log('service.updateItemComplete()');

        var deferred = $q.defer();

        var myId = id;
        var myVal = val;

        sqlDB.transaction(function (tx) {
          tx.executeSql('UPDATE tblListItems SET completed = ? WHERE id = ?', [myId, myVal], function (tx, resultSet) {
              deferred.resolve(resultSet);    // resultSet.insertId and resultSet.rowsAffected
            },
            function (tx, error) {
              console.log('UPDATE error: ' + error);

              deferred.reject(error);
            });
        });

        return deferred.promise;
      };

      service.deleteListItem = function(itemId) {
        console.log('service.deleteListItem()');

        var deferred = $q.defer();

        var myItemId = itemId;

        sqlDB.transaction(function (tx) {
            tx.executeSql('DELETE FROM tblListItems WHERE id = ?', [myItemId], function (tx, resultSet) {
                deferred.resolve(resultSet);    // resultSet.insertId and resultSet.rowsAffected
            });
        });

        return deferred.promise;
      };



      service.insertConversation = function(utter, answ, comment, useful) {
        if(conversation.request != "") {
          console.log('insertConversation()');

          if (!comment) {
            comment = "";
          }

          if (!useful) {
            useful = 0;
          }

          var urlConversation = dbtApp.manifest.baseURL + "postConversation.php?utter=" + encodeURI(utter) + "&answ=" + encodeURI(answ) + "&comment=" + encodeURI(comment) + "&useful=" + useful;

          console.log('urlConversation: ', urlConversation);

          $http({
            method: 'GET',
            url: urlConversation
          }).then(
            function success(resp) {
              var response = resp;

              conversation.request = "";
              conversation.response = "";
              conversation.useful = 0;
              conversation.comments = "";

              console.log('response: ', JSON.stringify(response));
            },
            function failure(resp) {
              console.log('failure resp: ', JSON.stringify(resp));
            }
          );

          service.insertSQLite(utter, answ, comment, useful).then(function (res) {
            console.log('insertSQLite() Success');
          }, function (err) {
            console.log('insertSQLite() Error', err);
          });

          service.inConversation = false;
        }
      };

      service.saveSetConversation = function() {
        service.insertConversation(conversation.request, conversation.response, conversation.comments, conversation.useful);
      };

      service.deleteHistoryItem = function() {
          var deferred = $q.defer();

          return deferred.promise;
      };

      var cnt = 0;
      service.selectHistory = function() {
        console.log('selectHistory() :: ');

        var deferred = $q.defer();

        if($rootScope.db) {

            var history = [];

            var query = "SELECT historyId, request, response, useful, comments, createdDate FROM history_table";
            $cordovaSQLite.execute($rootScope.db, query, []).then(function (result) {
              console.log('selectHistory - result: ', JSON.stringify(result.rows));

              for (var i = 0; i < result.rows.length; i++) {
                //console.log('result.rows.item(i): ', result.rows.item(i));

                history.unshift(result.rows.item(i));
              }

              console.log('history: ', history);

              deferred.resolve(history);
            }, function (error) {
              console.error("selectHistory -Eerror: ", JSON.stringify(error.message), error.code);

              deferred.reject(error.code);
            });

        } else {
            cnt++;

            if(cnt < 5) {
              $rootScope.db = $cordovaSQLite.openDB("my.db");

              service.selectHistory();
            } else {
              deferred.reject("Unable to open SQLite database");
            }
        }


        return deferred.promise;
      };

      service.insertSQLite = function(textSpoken, locationText, commentsText, useful) {
        var deferred = $q.defer();

        var d = new Date();
        var n = d.getTime();

        var historyId = n;
        var request = textSpoken;
        var response = locationText;
        var useful = 1;
        var comments = commentsText;
        var createdDate = d;

        var query = "INSERT INTO history_table (historyId, request, response, useful, comments, createdDate) VALUES (?, ?, ?, ?, ?, ?)";

        $cordovaSQLite.execute($rootScope.db, query, [historyId, request, response, useful, comments, createdDate]).then(function (result) {

          console.log('testInsert_SQLite - result: ', JSON.stringify(result));

          deferred.resolve(result);
        }, function (error) {
          //console.log("testInsert_SQLite - error: ", JSON.stringify(error.message));

          deferred.reject(error);
        });

        return deferred.promise;
      };

      ////////////////////////////////////////////////////////////////
      // LOCALSTORAGE METHODS ////////////////////////////////////////
      ////////////////////////////////////////////////////////////////

      service.resetStorageLS = function(key) {
          window.localStorage["myStore"] = "";
          window.localStorage["signin"] = "";
      };

      service.getMyStoreLS = function() {
        var res = window.localStorage['myStore'] || "";
        if(res == "") {
          return "";
        } else {
          return JSON.parse(res);
        }
      };

      service.setMyStoreLS = function(obj) {
        window.localStorage['myStore'] = JSON.stringify(obj);
      };

      service.setSignInLS = function(val) {
        window.localStorage['signin'] = val;
      };

      service.getSignInLS = function() {
        return window.localStorage['signin'] || "";
      };

      return service;
    })

}());
