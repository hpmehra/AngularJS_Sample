'use strict';

(function () {
    return angular.module('vpApp.leadController')
    .controller('layoutImageController', ['$scope','$translate', 'layoutImageService', 'layoutConfigService',
        'leadLayoutService', 'layoutTableDesignService', 'commonService', '$modal', '$log', '$route', '$window', 'lead_HOST', '$routeParams',
    function ($scope,$translate, layoutImageService, layoutConfigService, leadLayoutService, layoutTableDesignService, commonService,
        $modal, $log, $route, $window, lead_HOST, $routeParams) {

        var layoutType = "0";
        var layoutID = $routeParams.id || "1";

        $scope.layoutTypeText = $translate.instant('TEMPLATE') ;
        $scope.seletedLayout = 0;
        $scope.seletedArea = "0";
        $scope.colPropertiesSec2 = false;
        $scope.showColProperties = false;
        $scope.colAdjTypeHeader = false;
        $scope.selectedRowTableDesign = -1;

        var headerObject = {};
        var columnObject = {};
        var propertyObject = {};

        //initilization...
        $scope.layoutList = {};
        $scope.gridOptions = {
            enableColumnMenus: false,
            enableSorting: false,
            CellFilter: "translate",
            rowTemplate: '<div grid="grid" class="ui-grid-draggable-row" draggable="true">\
                        <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'custom\': true }" ui-grid-cell></div>\
                        </div>',
            useUiGridDraggableRowsHandle: true,
            uiGridDraggableService: layoutImageService,
            columnDefs: [
        {
            name: $translate.instant('IMAGENAME'), field: 'ImageName', width: "40%"
        }, {
            name: 'UpdatedDate', width: "10%",
            displayName: $translate.instant('UPLOADDATE'),
            cellFilter: 'date:\'MM/dd/yyyy\''
        },
        {
            name: $translate.instant('INCLUDE'), width: "10%", field: 'IsActive',
            cellTemplate: ' <input type="checkbox" ng-model="row.entity.IsActive" ng-change="grid.appScope.DeactivateRow(row);"></div>',
            cellClass: 'UIgrid-cell-align'
        },
        {
            name: $translate.instant('DELETE'), width: "20%",
            cellTemplate: '<button class="btn btn-danger" style="width:80%" ng-click="grid.appScope.deleteRow(row)">' +$translate.instant('DELETE') + '</button>',
            cellClass: 'UIgrid-cell-align'
        },

        {
            name: $translate.instant('VIEW'), width: "20%",
            cellTemplate: '<button class="btn btn-info" style="width:90%" ng-click="grid.appScope.showImagePopUp(row)">' +$translate.instant('VIEW') + '</button>',
            cellClass: 'UIgrid-cell-align'
        }]
        };

        $scope.gridOptions.onRegisterApi = function (gridApi) {
            gridApi.draggableRows.on.rowDropped($scope, function (info, dropTarget, scope) {

                var targetSortOrder = info.targetRowEntity.SortOrder;
                var draggedSortOrder = info.draggedRowEntity.SortOrder;

                var sortArray = [];

                if (draggedSortOrder > targetSortOrder) {
                    angular.forEach(scope.grid.options.data, function (data) {
                        if (data.SortOrder >= targetSortOrder && data.SortOrder < draggedSortOrder) {
                            sortArray.push({ "Id": data.Id, "SortOrder": data.SortOrder + 1 });
                            data.SortOrder = data.SortOrder + 1;
                        }
                    });
                } else if (draggedSortOrder < targetSortOrder) {
                    angular.forEach(scope.grid.options.data, function (data) {
                        if (data.SortOrder > draggedSortOrder && data.SortOrder <= targetSortOrder) {
                            sortArray.push({ "Id": data.Id, "SortOrder": data.SortOrder - 1 });
                            data.SortOrder = data.SortOrder - 1;
                        }
                    });
                }
                else {
                    return;
                }

                sortArray.push({ "Id": info.draggedRowEntity.Id, "SortOrder": targetSortOrder });
                info.draggedRowEntity.SortOrder = targetSortOrder;

                scope.grid.options.uiGridDraggableService.saveSortOrder(sortArray);

                scope.grid.options.data = sortByKey(scope.grid.options.data, 'SortOrder', true);

            });
        };

        function loadLayoutList() {
            leadLayoutService.getLayoutsActiveAll().then(function (data) {
                if (data.data != undefined) {
                    $scope.layoutList = data.data;
                    $scope.seletedLayout = layoutID;

                }
            })
        }

        function loadImagesInIt() {
            layoutImageService.getBackGroundImages(layoutType, layoutID).then(function (layoutsImages) {
                if (layoutsImages.data != undefined) {
                    $scope.gridOptions.data = sortByKey(layoutsImages.data, 'SortOrder', true);
                    $(window).resize();
                }
            })
        }

        function loadImages() {
            layoutImageService.getBackGroundImages(layoutType, layoutID).then(function (layoutsImages) {
                if (layoutsImages.data != undefined) {
                    $scope.gridOptions.data = sortByKey(layoutsImages.data, 'SortOrder', true);
                }
            })
        }

        $scope.deleteRow = function (row) {
            var index = $scope.gridOptions.data.indexOf(row.entity);
            $scope.gridOptions.data.splice(index, 1);

            layoutImageService.deleteBackGroundImages(row.entity.Id)
                .success(function () {
                    alertify.success($translate.instant('DELETEDSUCCESSFULLY'));
                })
                .error(function () {
                    alertify.error($translate.instant('ERROR'));
                });
        };

        $scope.DeactivateRow = function (row) {

            layoutImageService.upateLayoutImagesIsActive(row.entity.Id, row.entity.IsActive)
                .success(function () {
                    alertify.success((row.entity.IsActive) ? $translate.instant('INCLUDESUCCESSFULLY') : $translate.instant('EXCLUDEDSUCCESSFULLY'));
                })
                .error(function () {
                    alertify.error($translate.instant('ERROR'));
                });
        };


        $scope.open = function () {
            //Code change by Vandana for time Interval check on ADD NEW IMAGE button JIRA Task# VIS-58
            if (!($scope.layoutConfigs.TimeInterval != '' && !isNaN($scope.layoutConfigs.TimeInterval))) {
                alertify.error($translate.instant('TIMEINTERVALCANNOTBEBLANK'));
            }
                //Code ends here
            else
                {
        var paramhp = { 'layoutType': layoutType, 'layoutID': layoutID };
        var gg = $modal.open({
            templateUrl: 'app/partial/imageupload.html',
            backdrop: true,
            windowClass: 'modal',
            controller: 'imageUploadController'
             ,
            resolve: {
                paramhp: function () {
                    return paramhp;
                }
            }
        });
        gg.result.then(function (result) {
            angular.forEach(result, function (layoutImg) {
                $scope.gridOptions.data.push(layoutImg);
            });
        });
        }    
    };


        $scope.showImagePopUp = function (row) {

            var gg = $modal.open({
                templateUrl: 'app/partial/showimagepopup.html',
                backdrop: true,
                windowClass: 'modal',
                controller: 'showImagePopUpController'
                 ,
                resolve: {
                    imageData: function () {
                        return row.entity.ImageBinary;
                    }
                }
            });

        };

        //interval Timer section start..hp
        $scope.layoutConfigs = { 'TimeInterval': '', 'Type': layoutType, "layoutID": layoutID, 'Id': 0 };



        function loadTimeInterval() {
            layoutConfigService.getLayoutConfigAllByTypeID(layoutID, layoutType).then(function (timeIntervals) {
                if (timeIntervals.data != undefined && timeIntervals.data != '')
                    $scope.layoutConfigs = timeIntervals.data;
                else
                    $scope.layoutConfigs = { 'TimeInterval': '', 'Type': layoutType, "layoutID": layoutID, 'Id': 0 };
            })
        }

        $scope.saveInterval = function () {
            //Code change by Vandana for time Interval null check (3)JIRA Task# VIS-58 and VIS-53
            var _TimeInterval = $scope.layoutConfigs.TimeInterval;
            if (!(_TimeInterval != '' && !isNaN(_TimeInterval) && _TimeInterval >= 0)) {
                alertify.error($translate.instant('TIMEINTERVALSHOULDBEAPOSITIVENUMBERANDCANNOTBEBLANK'));
                $scope.layoutConfigs.TimeInterval = "";
            }
                //Code ends here
            else {

                layoutConfigService.insertLayoutConfig($scope.layoutConfigs)
                    .success(function (data) {
                        $scope.layoutConfigs = data;
                        alertify.success($translate.instant('SAVEDSUCCESSFULLY'));
                    })
                    .error(function (err) {
                        console.log(err);
                        alertify.error($translate.instant('ERROR'));
                    });
            }
        }
        //interval Timer section end..hp


        //table Designer section...hp
        //initilization...

        //$scope.gridTableOptions = {};

        $scope.gridTableOptions = {
            rowTemplate: '<div grid="grid" class="ui-grid-draggable-row" draggable="true">\
                <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'uiGridSelectedRow\':grid.appScope.rowFormatter(row),\'ui-grid-row-header-cell\': col.isRowHeader, \'custom\': true }" ui-grid-cell></div>\
                </div>'
        };
        $scope.gridTableOptions.useUiGridDraggableRowsHandle = true;
        $scope.gridTableOptions.enableSorting = false;
        $scope.gridTableOptions.enableColumnMenus = false;
        $scope.gridTableOptions.uiGridDraggableService = layoutTableDesignService;

        $scope.gridTableOptions.columnDefs = [
            {
                name: $translate.instant('SELECT'), width: "18%",
                cellTemplate: ' <input type="checkbox" ng-model="row.entity.IsActive" ng-change="grid.appScope.saveLayoutTableDesign(row);"></div>',
                enableHiding: false
            },
            {
                name: $translate.instant('COLUMNNAMES'),field: 'ColumnNames', width: "55%", enableHiding: false
            },
            {
                name: $translate.instant('PROPERTIES'), width: "37%", field: 'IsActive', enableHiding: false,
                cellTemplate: '<button class="btn btn-primary" style="width:70%" ng-click="grid.appScope.showColumnProperties(row)" ng-disabled="!row.entity.IsActive">' + $translate.instant('PROPERTIES') + ' </button>'

            }
        ];
        function sortByKey(array, key, asc) {
            return array.sort(function (a, b) {
                var x = a[key]; var y = b[key];
                return asc ? ((x < y) ? -1 : ((x > y) ? 1 : 0)) : ((x > y) ? -1 : ((x < y) ? 1 : 0));
            });
        }

        // Access outside scope functions from row template
        $scope.rowFormatter = function (row) {
            return row.entity.Id == $scope.selectedRowTableDesign;
        };

        function loadLayoutTableDesignAllInIt() {
            layoutTableDesignService.getLayoutTableDesignColumnsAllByLayoutID(layoutID).then(function (data) {
                if (data.data != undefined) {

                    $scope.gridTableOptions.data = sortByKey(data.data, 'SortOrder', true);
                }
            });
        }
   
        $scope.gridTableOptions.onRegisterApi = function (gridApi) {
            gridApi.draggableRows.on.rowDropped($scope, function (info, dropTarget, scope) {

                var targetSortOrder = info.targetRowEntity.SortOrder;
                var draggedSortOrder = info.draggedRowEntity.SortOrder;

                var sortArray = [];

                if (draggedSortOrder > targetSortOrder) {
                    angular.forEach(scope.grid.options.data, function (data) {
                        if (data.SortOrder >= targetSortOrder && data.SortOrder < draggedSortOrder) {
                            sortArray.push({ "Id": data.Id, "SortOrder": data.SortOrder + 1 });
                            data.SortOrder = data.SortOrder + 1;
                        }
                    });
                } else if (draggedSortOrder < targetSortOrder) {
                    angular.forEach(scope.grid.options.data, function (data) {
                        if (data.SortOrder > draggedSortOrder && data.SortOrder <= targetSortOrder) {
                            sortArray.push({ "Id": data.Id, "SortOrder": data.SortOrder - 1 });
                            data.SortOrder = data.SortOrder - 1;
                        } 
                    });
                }
                else {
                    return;
                }

                sortArray.push({ "Id": info.draggedRowEntity.Id, "SortOrder": targetSortOrder });
                info.draggedRowEntity.SortOrder = targetSortOrder;

                scope.grid.options.uiGridDraggableService.saveSortOrder(sortArray);

                scope.grid.options.data = sortByKey(scope.grid.options.data, 'SortOrder', true);

            });
        };

        function loadLayoutTableDesignAll() {
            layoutTableDesignService.getLayoutTableDesignColumnsAllByLayoutID(layoutID).then(function (data) {
                if (data.data != undefined) {
                    $scope.gridTableOptions = { data: data.data };
                }
            });
        }

        function loadColumnHeaderAppearance(layoutTableDesignID) {
            layoutTableDesignService.getColumnHeaderAppearance(layoutTableDesignID).then(function (data) {
                if (data.data != undefined) {
                    $scope.colPropertiesSec.ColumnWidth = data.data.ColumnWidth;
                    $scope.colPropertiesSec.colTextColor = data.data.hdTextColor;
                    $scope.colPropertiesSec.colFontName = data.data.hdFontName;
                    $scope.colPropertiesSec.colTextBold = data.data.hdTextBold;
                    $scope.colPropertiesSec.colTextItalic = data.data.hdTextItalic;
                    $scope.colPropertiesSec.colTextSize = data.data.hdTextSize;
                    $scope.colPropertiesSec.colBackGroundTransparent = data.data.hdBackGroundTransparent;
                    $scope.colPropertiesSec.colBackGroundColor = data.data.hdBackGroundColor;
                    $scope.colPropertiesSec.colTextAlignment = data.data.hdTextAlignment;

                    propertyObject.header = {};
                    angular.copy(data.data, propertyObject.header);

                    // propertyObject.header = data.data;
                    propertyObject.isColumn = false;
                }
            });
        }

        function loadColumnAppearance(layoutTableDesignID) {
            layoutTableDesignService.getColumnAppearance(layoutTableDesignID).then(function (data) {
                if (data.data != undefined) {
                    $scope.colPropertiesSec = data.data;
                    //columnObject = data.data;
                    propertyObject.column = {};
                    angular.copy(data.data, propertyObject.column);
                    //propertyObject.column = data.data;
                    propertyObject.isColumn = true;

                }
            });
        }

        $scope.saveLayoutTableDesign = function (row) {
            layoutTableDesignService.saveLayoutTableDesign(row.entity)
                .success(function (data) {
                    row.entity.Id = data.Id;
                    alertify.success($translate.instant('SAVEDSUCCESSFULLY'));
                })
                .error(function () {
                    alertify.error($translate.instant('ERROR'));
                });
        }

        $scope.saveColumnProperties = function () {
            if ($scope.colAdjTypeHeader) {
                saveColumnHeaderAppearance(false)
            }
            else {
                saveColumnAppearance(false);
            }
        }

        function saveColumnPropertiesMirror(colAdjType) {
            if (colAdjType == 'colHeader') {
                saveColumnHeaderAppearance(true)
            }
            else {
                saveColumnAppearance(true);
            }
        }

        $scope.cancelColumnProperties = function () {
            if ($scope.colAdjTypeHeader) {
                loadColumnHeaderAppearance($scope.colPropertiesSec.Id)
            } else {
                loadColumnAppearance($scope.colPropertiesSec.Id)
            }
        }

        function saveColumnAppearance(autoSave) {
            layoutTableDesignService.saveColumnAppearance($scope.colPropertiesSec)
                .success(function () {
                    alertify.success($translate.instant('SAVEDSUCCESSFULLY'));
                    if (autoSave)
                        colAdjustmentSelectionChild();
                })
                .error(function () {
                    alertify.error($translate.instant('ERROR'));
                });
        }
        function saveColumnHeaderAppearance(autoSave) {
            var data = {
                'Id': $scope.colPropertiesSec.Id,
                'ColumnWidth': $scope.colPropertiesSec.ColumnWidth,
                'columnHeaderCaption': $scope.colPropertiesSec.columnHeaderCaption,
                'hdTextColor': $scope.colPropertiesSec.colTextColor,
                'hdFontName': $scope.colPropertiesSec.colFontName,
                'hdTextBold': $scope.colPropertiesSec.colTextBold,
                'hdTextItalic': $scope.colPropertiesSec.colTextItalic,
                'hdTextSize': $scope.colPropertiesSec.colTextSize,
                'hdBackGroundTransparent': $scope.colPropertiesSec.colBackGroundTransparent,
                'hdBackGroundColor': $scope.colPropertiesSec.colBackGroundColor,
                'hdTextAlignment': $scope.colPropertiesSec.colTextAlignment
            };

            layoutTableDesignService.saveColumnHeaderAppearance(data)
                .success(function () {
                    alertify.success($translate.instant('SAVEDSUCCESSFULLY'));
                    if (autoSave)
                        colAdjustmentSelectionChild();
                })
                .error(function () {
                    alertify.error($translate.instant('ERROR'));
                });
        }

        $scope.showColumnProperties = function (row) {
            if (validationForColumnProperties(row.entity.Id)) {
                if (!$scope.IsChange(propertyObject, $scope.colPropertiesSec)) {
                    if ($scope.showColProperties) {
                        alertify.confirm("Do you want to save " + (($scope.colAdjTypeHeader) ? "Header" : "Column") + " properties for " + $scope.colName, function (e) {
                            if (e) {
                                $scope.saveColumnProperties($scope.colAdjTypeHeader);
                                showColProp(row);
                            }
                            else {
                                showColProp(row);
                            }
                        });
                    }
                    else {
                        showColProp(row);
                    }
                } else {
                    showColProp(row);
                }
            }

            $scope.selectedRowTableDesign = row.entity.Id;
        }

        function showColProp(row) {
            $scope.colName = row.entity.ColumnNames;
            $scope.colAdjTypeHeader = false;
            $scope.colPropertiesSec2 = true;
            loadColumnAppearance(row.entity.Id)
            $scope.showColProperties = true;
            propertyObject.Id = row.entity.Id;
        }

        $scope.colAdjustmentSelection = function (colAdj) {
            if (!$scope.IsChange(propertyObject, $scope.colPropertiesSec)) {
                var colAdjTypeTxt = ((colAdj == true) ? "Column" : "Header")
                alertify.confirm("Do you want to save " + colAdjTypeTxt + " properties for " + $scope.colName, function (e) {
                    if (e) {
                        propertyObject.isColumn = colAdj;
                        saveColumnPropertiesMirror(!$scope.colAdjTypeHeader);
                        $scope.$apply();

                    } else {
                        propertyObject.isColumn = colAdj;

                        colAdjustmentSelectionChild();
                    }
                });
            } else {
                propertyObject.isColumn = colAdj;
                colAdjustmentSelectionChild();
            }
        }


        function colAdjustmentSelectionChild() {
            if ($scope.colAdjTypeHeader) {
                $scope.colPropertiesSec2 = false;
                loadColumnHeaderAppearance($scope.colPropertiesSec.Id)
            } else {
                $scope.colPropertiesSec2 = true;
                loadColumnAppearance($scope.colPropertiesSec.Id)
            }
        }

        function loadFontFamily() {
            commonService.getFontFamilyList().then(function (fontFamilies) {
                $scope.fontFamilies = fontFamilies.data;
            })
        }



        //table Designer section end...hp

        //page load events..hp
        loadLayoutList();
        loadFontFamily();

        //validation section..hp
        $scope.checkTemplateSelected = function () {
            if (layoutID < 1)
                alertify.alert($translate.instant('SELECTTEMPLATEFIRST!'));
        }
        function validationForColumnProperties(Id) {
            if (Id < 1) {
                alertify.alert($translate.instant('SAVEDCOLUMNFIRST!'));
                return false;
            }
            else
                return true;
        }
        //validation section end..hp

        //dropdown ddlControlPanelSelection..hp
        $scope.ddlControlPanelSelection = function () {
            layoutType = $scope.seletedArea;

            ControlPanelSelection();
        }


        $scope.ddlLayoutSelection = function () {
            layoutID = $scope.seletedLayout;
            if ($scope.seletedArea < 1)
                layoutType = $scope.seletedArea = "3";
            ControlPanelSelection();
        }

        function loadImagesAndInterval() {
            loadImagesInIt();
            loadTimeInterval();
        }

        function ControlPanelSelection() {
            if (layoutType == 4) {
                loadLayoutTableDesignAllInIt();
            }
            else {
                loadImagesAndInterval();
            }

            switch ($scope.seletedArea) {
                case "1":
                    $scope.layoutTypeText = $translate.instant('GRAPHIC1');
                    break;
                case "2":
                    $scope.layoutTypeText = $translate.instant('GRAPHIC2');
                    break;
                case "3":
                    $scope.layoutTypeText = $translate.instant('BACKGROUND');
                    break;
                case "4":
                    $scope.layoutTypeText = $translate.instant('PGPROPERTIES');
                    break;
                default:
                    $scope.layoutTypeText = "Layout";
            }
        }

        $scope.back = function () {
            if ($scope.seletedLayout > 0) {
                $window.open(lead_HOST + '#/dashboard?id=' + btoa($scope.seletedLayout), '_blank');

            }
        }
        $scope.IsChange = function (prop, newObj) {
            var oldObj = (prop.isColumn) ? prop.column : prop.header;

            if (prop.isColumn == undefined)
                return;

            if (prop.isColumn) {
                if (oldObj.ColumnWidth != newObj.ColumnWidth) {
                    return false;
                }

                if (oldObj.colTextColor != newObj.colTextColor) {
                    return false;
                }

                if (oldObj.colFontName != newObj.colFontName) {
                    return false;
                }
                if (oldObj.colTextBold != newObj.colTextBold) {
                    return false;
                }

                if (oldObj.colTextItalic != newObj.colTextItalic) {
                    return false;
                }
                if (oldObj.colTextSize != newObj.colTextSize) {
                    return false;
                }
                if (oldObj.colBackGroundColor != newObj.colBackGroundColor) {
                    return false;
                }
                if (oldObj.colBackGroundTransparent != newObj.colBackGroundTransparent) {
                    return false;
                }

                if (oldObj.colTextAlignment != newObj.colTextAlignment) {
                    return false;
                }

                if (oldObj.altRowColor != newObj.altRowColor) {
                    return false;
                }
                if (oldObj.colBackColor != newObj.colBackColor) {
                    return false;
                }

                if (oldObj.colCellBorderColor != newObj.colCellBorderColor) {
                    return false;
                }

                if (oldObj.colCellBorderSize != newObj.colCellBorderSize) {
                    return false;
                }

                if (oldObj.colCellBorlderBottom != newObj.colCellBorlderBottom) {
                    return false;
                }

                if (oldObj.colCellBorlderLeft != newObj.colCellBorlderLeft) {
                    return false;
                }

                if (oldObj.colCellBorlderRight != newObj.colCellBorlderRight) {
                    return false;
                }
                if (oldObj.colCellBorlderTop != newObj.colCellBorlderTop) {
                    return false;
                }

                if (oldObj.evenRowColor != newObj.evenRowColor) {
                    return false;
                }
                if (oldObj.oddRowColor != newObj.oddRowColor) {
                    return false;
                }
            } else {

                if (oldObj.ColumnWidth != newObj.ColumnWidth) {
                    return false;
                }

                if (oldObj.hdTextColor != newObj.colTextColor) {
                    return false;
                }

                if (oldObj.hdFontName != newObj.colFontName) {
                    return false;
                }
                if (oldObj.hdTextBold != newObj.colTextBold) {
                    return false;
                }

                if (oldObj.hdTextItalic != newObj.colTextItalic) {
                    return false;
                }
                if (oldObj.hdTextSize != newObj.colTextSize) {
                    return false;
                }
                if (oldObj.hdBackGroundColor != newObj.colBackGroundColor) {
                    return false;
                }
                if (oldObj.hdBackGroundTransparent != newObj.colBackGroundTransparent) {
                    return false;
                }

                if (oldObj.hdTextAlignment != newObj.colTextAlignment) {
                    return false;
                }

            }

            return true;

        }

    }])
})();
