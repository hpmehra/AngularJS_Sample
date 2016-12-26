'use strict';
(function () {
    // Declare app level module which depends on filters, and services

    var vpApp = angular.module('vpApp',
        ['ui.bootstrap',
            'angular-loading-bar',
            'ngAnimate',
            'ngTouch',
            'ui.grid',
            'ngRoute',
            'ui.grid.draggable-rows',
            "pascalprecht.translate",
            'vp.routingConfig',
            'vp.leadController',
            'vp.leadServices',
            'vp.leadDirectives'
            
        ]);

    return vpApp;
})();


