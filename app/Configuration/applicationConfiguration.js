'use strict';
(function () {
    angular.module('applicationConfiguration')
       .constant('API_END_POINT', 'http://localhost/vp.Api/api/')
        .constant('API_INTEGRATION_END_POINT', 'http://localhost/vp.Web/api/')
       .constant('LEAD_HOST', 'http://localhost/vp.Lead.Web/');
})();
