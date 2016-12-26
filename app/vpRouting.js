'use strict';
(function () {
    return angular.module("vpApp.routingConfig", [])
        .config([
            '$routeProvider', '$httpProvider', '$translateProvider', 'cfpLoadingBarProvider',
            function ($routeProvider, $httpProvider, $translateProvider, cfpLoadingBarProvider) {
                $httpProvider.defaults.useXDomain = true;
                delete $httpProvider.defaults.headers.common['X-Requested-With'];
                $httpProvider.interceptors.push('authInterceptorService');
                //cfpLoadingBarProvider.includeSpinner = false;
                cfpLoadingBarProvider.includeBar = false;
                cfpLoadingBarProvider.parentSelector = '#divMasterHeader';
                cfpLoadingBarProvider.spinnerTemplate = '<div id="busy" style="z-index: 9999;position:fixed;top:30%;" class="col-lg-offset-5 ui-progressbar-overlay"><img src="./images/progressbar.gif" alt="progress"></div>';

                $routeProvider
                    .when('/leadevent',
                    {
                        templateUrl: 'app/partial/eventlist.html',
                        controller: 'eventController'
                    })
                    .when('/layouts',
                    {
                        templateUrl: 'app/partial/LeadLayout.html',
                        controller: 'LeadLayoutController'
                    })
                    .when('/background',
                    {
                        templateUrl: 'app/partial/LayoutImages.html',
                        controller: 'layoutImageController'
                    })
                    .otherwise(
                    {
                        redirectTo: '/background'
                    });


                $translateProvider.useStaticFilesLoader({
                    prefix: '/Viper.LeaderBoard.Web/app/translate/locale-',
                    suffix: '.json'
                }).registerAvailableLanguageKeys(['en', 'de','es','ja','zh'], {
                    'en_*': 'en',
                    'de_*': 'de',
                    'es_*': 'es',
                    'ja_*': 'ja',
                    'zh_*': 'zh'


                })
                .determinePreferredLanguage();
            }
        ]);
})();



