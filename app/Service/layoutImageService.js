'use strict';
(function () {
    angular.module('vpApp.leadServices')

    .factory("layoutImageService", ['$http', '$q', 'API_END_POINT', function ($http, $q, API_END_POINT) {
         
        //var serviceBase = 'http://localhost:53092/api/LayoutImage/'
        var serviceBase = API_END_POINT +  'LayoutImage/'
        var seobj = {};

        seobj.getBackGroundImages = function (layouttype, layoutID) {
            return $http.get(serviceBase + 'GetLayoutBackGroundAll/?layouttype=' + layouttype + '&layoutID=' + layoutID);
        }

        seobj.postBackGroundImages = function (files, layouttype, layoutID) {
            var fd = new FormData();
            angular.forEach(files, function (file) { fd.append(file.name, file); });
            
            return $http.post(serviceBase + 'PostLayoutBackGround/?layouttype=' + layouttype + '&layoutID=' + layoutID, fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            })
        }

        seobj.upateLayoutImagesIsActive = function (Id, isActive) {
            return $http.post(serviceBase + 'updateLayoutImagesIsActive/?Id=' + Id + '&isActive=' + isActive)
        }

        seobj.saveSortOrder = function (sortingModel) {
            return $http.post(serviceBase + 'UpdateSortOrder', sortingModel);
        }

        seobj.deleteBackGroundImages = function (Id) {
            return $http.delete(serviceBase + 'DeleteLBBackGroundLayoutsById/' + Id)

        }

        seobj.backgroundImageIds = function (layoutID) {
            var deferred = $q.defer();
            var promise = $http.get(serviceBase + 'GetImageIds?eventId=' + layoutID).success(function (data) {
                deferred.resolve(data);
            }).error(function (data, status) {
                deferred.reject(data);
            });
            return promise;
        }

        seobj.getImageIdByEventAndLayout = function (templateId, layoutType) {
            var deferred = $q.defer();
            var promise = $http.get(serviceBase + 'getImageIdByEventAndLayout?layoutId=' + templateId + '&layoutType=' + layoutType).success(function (data) {
                deferred.resolve(data);
            }).error(function (data, status) {
                deferred.reject(data);
            });
            return promise;
        }
        return seobj;
    }
    ])
})();
