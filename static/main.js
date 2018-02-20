var app = angular.module('myApp', ['ngRoute', 'lr.upload']);
app.config(['$interpolateProvider', function ($interpolateProvider)
{
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}]);
app.config(['$locationProvider', function ($locationProvider)
{
    $locationProvider.hashPrefix('');
}]);

app.config(['$routeProvider', function ($routeProvider)
{
    $routeProvider.when("/upload", {
        templateUrl: "../partial/uploadvid.html",
        controller: "uploadVidCtrl",
        controllerAs: "ctrl"
    });
    $routeProvider.when("/watch", {
        templateUrl: "../partial/watchvid.html",
        controller: "watchVidCtrl",
        controllerAs: "ctrl"
    });
    $routeProvider.when("/search", {
        templateUrl: "../partial/searchvid.html",
        controller: "searchVidCtrl",
        controllerAs: "ctrl"
    });
}]);

app.controller('mainCtrl', ['$scope', '$http', function ($scope, $http)
{
    var ctrl = this;
    ctrl.name = 'Ctrl-FV!';
}]);

angular.module("myApp").directive("filesInput", function ()
{
    return {
        require: "ngModel",
        link: function postLink(scope, elem, attrs, ngModel)
        {
            elem.on("change", function (e)
            {
                var files = elem[0].files;
                ngModel.$setViewValue(files);
            })
        }
    }
});

