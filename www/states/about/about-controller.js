(function(){

    angular.module('ionicApp')

        .controller('AboutCtrl', function($rootScope, $scope, $state, $ionicModal, $ionicLoading, dbtApp, config) {

            var vm = this;

            vm.version;
            vm.build;
            vm.isDeviceBuild;
            vm.isWebView;
            vm.deviceInformation;
            vm.hardPlatform;
            vm.isIOS;
            vm.isAndroid;
            vm.inDev;
            vm.inDebug;
            vm.isCordovaApp;
            vm.isDevice;

            vm.mapsPath;

            function init() {
                console.log('init() :: config: ', JSON.stringify(config));

                vm.test = config.deviceInformation;

                vm.version = config.VERSION;
                vm.build = config.BUILD;
                vm.isDeviceBuild = config.isDeviceBuild;
                vm.isWebView = config.isWebView;
                vm.deviceInformation = config.deviceInformation;
                vm.devicePlatform = config.deviceInformation.platform;
                vm.isVirtual = config.deviceInformation.isVirtual;
                vm.hardPlatform = config.hardPlatform;
                vm.isIOS = config.isIOS;
                vm.isAndroid = config.isAndroid;
                vm.inDev = config.inDev;
                vm.inDebug = config.inDebug;
                vm.isCordovaApp = config.isCordovaApp;
                vm.isDevice = config.isDevice;

                vm.myconfig = config;

                vm.mapsPath = dbtApp.fbMapsRef;
            }

            init();
        })

}());
