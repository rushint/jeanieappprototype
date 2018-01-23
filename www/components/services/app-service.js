(function(){

    angular.module('ionicApp')

        .factory('dbtApp', function() {

            var myStoreObj = {};

            var myCurrStoreObj = {};

            return {
                currStoreObj: null,

                isSignObj: null,

                manifest: {
                  "baseURL": "http://doubleblacktech.com/genii-app/",
                  "bluemixURL": "http://genii-php-mysql.mybluemix.net/",
                  "mode": "DEV",
                  "isMaintenance": false
                },

                currStoreCode : null,

                currProductCategoryId: null,

                currResponse: null,

                origProducts: [],
                allProducts: [],

                selProductCat: 0,

                fileName: "genii-audio-file.wav",

                pathToFile: "",

                directory: "",

                src: "",

                localURL: "",

                currListName: "",

                categoriesArr: [],
                categoryName: "",

                fbApp: null,
                fbMapsStorage: null,
                fbStorageRef: null,

                getCurrStoreObj: function() {
                    return myCurrStoreObj;
                },

                setCurrStoreObj: function(obj) {
                    myCurrStoreObj = obj;
                }
            };
        });

}());
