(function(){

    angular.module('ionicApp')

        .config(function($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider) {
            console.log('config module');

            $stateProvider

                .state('loading', {
                  url: "/loading",
                  templateUrl: "states/loading/loading-view.html",
                  controller: 'LoadingCtrl as loading'
                })

                .state('auth', {
                  url: "/auth",
                  abstract: true,
                  templateUrl: "states/side-menu/side-menu-auth-view.html",
                  controller: 'AuthCtrl as auth'
                })

                    .state('auth.walkthrough', {
                      url: '/walkthrough',
                      views: {
                        'authContent': {
                          templateUrl: 'states/auth/walkthrough.html',
                          controller: 'WalkthroughCtrl as walkthrough'
                        }
                      }
                    })

                    .state('auth.signup', {
                      url: '/signup',
                      views: {
                        'authContent': {
                          templateUrl: 'states/auth/signup.html',
                          controller: 'SignupCtrl as signup'
                        }
                      }
                    })

                    .state('auth.signin', {
                      url: '/signin',
                      views: {
                        'authContent': {
                          templateUrl: 'states/auth/signin.html',
                          controller: 'SigninCtrl as signin'
                        }
                      }
                    })

                    .state('auth.forgotpassword', {
                      url: '/forgotpassword',
                      views: {
                        'authContent': {
                          templateUrl: 'states/auth/forgot-password.html',
                          controller: 'ForgotPasswordCtrl as forgot'
                        }
                      }
                    })

                .state('app', {
                    url: "/app",
                    abstract: true,
                    templateUrl: "states/side-menu/side-menu-view.html",
                    controller: 'AppCtrl as app'
                })

                    .state('app.stores', {
                      cache: false,
                      url: "/stores",
                      views: {
                        'appContent': {
                          templateUrl: "states/stores/stores-view.html",
                          controller: 'StoresCtrl as store'
                        }
                      }
                    })

                    .state('app.store-sel', {
                      cache: false,
                      url: "/store-sel",
                      views: {
                        'appContent': {
                          templateUrl: "states/stores/store-sel-view.html",
                          controller: 'StoreSelCtrl as storesel'
                        }
                      }
                    })

                    .state('app.mystorecat1', {
                      url: "/mystorecat1",
                      cache: false,
                      views: {
                        'appContent': {
                          templateUrl: "states/stores/mystore-cat1-view.html",
                          controller: 'MyStoreCat1Ctrl as mystore1'
                        }
                      }
                    })

                    .state('app.mystorecat2', {
                      url: "/mystorecat2",
                      views: {
                        'appContent': {
                          templateUrl: "states/stores/mystore-cat2-view.html",
                          controller: 'MyStoreCat2Ctrl as mystore2'
                        }
                      }
                    })

                    .state('app.mylists', {
                      url: "/mylists",
                      cache: false,
                      views: {
                        'appContent': {
                          templateUrl: "states/mylists/mylists-view.html",
                          controller: 'MyListsCtrl as mylists'
                        }
                      }
                    })

                    .state('app.mylistitems', {
                      url: "/mylistitems/:id",
                      cache: false,
                      views: {
                        'appContent': {
                          templateUrl: "states/mylists/mylist-items-view.html",
                          controller: 'MyListItemsCtrl as myitems'
                        }
                      }
                    })

                    .state('app.concierge', {
                        url: "/concierge",
                        views: {
                            'appContent': {
                                templateUrl: "states/concierge/concierge-view.html",
                                controller: 'ConciergeCtrl as concierge'
                            }
                        }
                    })

                    .state('app.map', {
                        url: "/map",
                        cache: false,
                        views: {
                            'appContent': {
                                templateUrl: "states/map/map-view.html",
                                controller: 'MapCtrl as map'
                            }
                        }
                    })

                    .state('app.about', {
                        url: "/about",
                        views: {
                            'appContent': {
                                templateUrl: "states/about/about-view.html",
                                controller: 'AboutCtrl as about'
                            }
                        }
                    })

                    .state('app.testing', {
                        url: "/testing",
                        views: {
                            'appContent': {
                                templateUrl: "states/testing/testing-speechtotext-view.html",
                                controller: 'testingSTTCtrl as stt'
                            }
                        }
                    });

                //////////////////////////

            //$urlRouterProvider.otherwise('/app/conciergemap');
            //$urlRouterProvider.otherwise('/app/about');
            $urlRouterProvider.otherwise('/loading');

        })

}());
