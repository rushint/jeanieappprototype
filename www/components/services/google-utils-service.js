(function(){
  angular
    .module('ionicApp')

    .factory('googleUtilsService', function($rootScope, config) {
      var service = {};

      var gsTrackerId = 'UA-83251637-1';

      var toState = null;

      if(typeof google != "undefined") {
        config.isGoogle = true;
      } else {
        config.isGoogle = false;
      }

      service.initGA = function() {
        if(typeof window.analytics !== undefined) {
          console.log('Google Analytics Initialize');

          window.analytics.startTrackerWithId(gsTrackerId);
        } else {
          console.log("initGA() :: Google Analytics Unavailable");
        }
      };

      service.gaTrackView = function(view) {
        if(view != toState) {
          toState = view;

          console.log('gaTrackView() -> view: ', view);

          if (typeof window.analytics !== undefined) {
            window.analytics.trackView(view);
          } else {
            console.log("gaTrackView() :: Google Analytics Unavailable");
          }
        }
      };

      service.gaTrackEvent = function(param) {
        console.log('gaTrackEvent() -> category: ' + param.category + " - action:" + param.action + " - label: " + param.label + " - value: " + param.value);

        if (window.analytics) {
          window.analytics.trackEvent(param.category, param.action, param.label, param.value);
        } else {
          console.log("gaTrackEvent() :: Google Analytics Unavailable");
        }
      };

      return service;
    })

}());
