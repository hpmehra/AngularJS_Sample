"use strict";

(function () {
    return angular.module("vpApp.leadDirectives")

         .directive("testMarquee", ["$parse", function($parse) {
             return {
                 restrict: "E",
                 scope: {
                     options: "=options"
                 },
                 link: function (scope, element) {
                     element.marquee(scope.options);
                 }
             };
         }])

.directive("draggableResizable", ["layoutConfigService", function (layoutConfigService) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            scope.template = attrs.template;
            scope.public = attrs.public != null ? attrs.public : "true";

            if (scope.public == "false") {
                element.draggable({
                    cursor: "move",
                    stop: function (event, ui) {

                        var xpos = parseFloat(ui.position.left / ($(".height").width() / 100)) + "%";
                        var ypos = parseFloat(ui.position.top / ($(".height").height() / 100)) + "%";
                        var width = "";
                        var height = "";
                        this.style.left = xpos;
                        this.style.top = ypos;
                        layoutConfigService.updateLayoutConfiguration(scope.template, xpos, ypos,
                            width, height, event.target.id);
                        //scope.$apply();
                    },

                    containment: ".height",

                });

                element.resizable();
                element.on("resizestop", function (evt, ui) {
                    var xpos = parseFloat(ui.position.left / ($(".height").width() / 100)) + "%";
                    var ypos = parseFloat(ui.position.top / ($(".height").height() / 100)) + "%";

                    var width = parseFloat(ui.element.width() / ($(".height").width() / 100)) + "%";
                    var height = parseFloat(ui.element.height() / ($(".height").height() / 100)) + "%";

                    this.style.width = width;
                    this.style.height = height;
                    this.style.left = xpos;
                    this.style.top = ypos;

                    layoutConfigService.updateLayoutConfiguration(scope.template, xpos, ypos,
                        width, height, ui.originalElement[0].id);
                    //scope.$apply();
                });
            }
        }
    };
}])

.directive("resizable", function () {
    return {
        restrict: "A",
        link: function (scope, elem, attrs) {
            scope.template = attrs.template;
            elem.resizable();
            elem.on("resizestop", function (evt, ui) {
                var xpos = "";
                var ypos = "";
                this.style.width = parseFloat(ui.element.width() / ($(".height").width() / 100)) + "%";
                this.style.height = parseFloat(ui.element.height() / ($(".height").height() / 100)) + "%";
                this.style.left = parseFloat(ui.position.left / ($(".height").width() / 100)) + "%";
                this.style.top = parseFloat(ui.position.top / ($(".height").height() / 100)) + "%"

                layoutConfigService.updateLayoutConfiguration(scope.template, xpos, ypos,
                        width, height, event.target.id);

                scope.$apply();
            });
        }
    };
})

.directive("dynamic", function ($compile) {
    return {
        restrict: "A",
        replace: true,
        link: function (scope, ele, attrs) {
            scope.$watch(attrs.dynamic, function (html) {
                ele.html(html);
                $compile(ele.contents())(scope);
            });
        }
    };
})
.directive("slideshow", function ($interval) {
    return {
        restrict: "A",
        scope: {
            ngBgSlideshow: "=",
            interval: "="
        },
        templateUrl: "app/partial/slideshow.html",
        link: function (scope) {
            scope.$watch("ngBgSlideshow", function (newVal) {
                scope.images = newVal;
                scope.active_image = 0;
            });

            scope.$watch("interval", function (newVal) {
                $interval.cancel(scope.change);
                if (newVal != undefined) {
                    scope.change = $interval(function () {
                        scope.active_image++;

                        if (scope.active_image >= scope.images.length)
                            scope.active_image = 0;

                    }, newVal);
                }
            });

            scope.$on("$destroy", function () {
                $interval.cancel(scope.change);
            });
        }
    };
});



}())