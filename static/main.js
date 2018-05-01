var app = angular.module('myApp', ['ngRoute', 'lr.upload', 'ngMaterial', 'LocalStorageModule', 'ui.bootstrap']);
app.config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('yourAppName');
});
app.config(['$interpolateProvider', function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}]);
app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('');
}]);
app.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('red').primaryPalette('red');
    $mdThemingProvider.theme('blue').primaryPalette('blue');
});

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when("/", {
        templateUrl: "../partial/home.html",
        controller: "searchVidCtrl",
        controllerAs: "ctrl"
    });
    $routeProvider.when("/upload", {
        templateUrl: "../partial/uploadvid.html",
        controller: "uploadVidCtrl",
        controllerAs: "ctrl"
    });
    $routeProvider.when("/watch/:vidId", {
        templateUrl: "../partial/watchvid.html",
        controller: "watchVidCtrl",
        controllerAs: "ctrl"
    });
    $routeProvider.when("/login", {
        templateUrl: "../partial/login.html",
        controller: "loginCtrl",
        controllerAs: "ctrl"
    });
    $routeProvider.when("/signup", {
        templateUrl: "../partial/signup.html",
        controller: "signupCtrl",
        controllerAs: "ctrl"
    });
    $routeProvider.when("/myVids", {
        templateUrl: "../partial/myVids.html",
        controller: "myVidsCtrl",
        controllerAs: "ctrl"
    })
}]);

app.controller('mainCtrl', ['$scope', '$http', 'userService', function ($scope, $http, userService) {
    var ctrl = this;
    ctrl.userService = userService;

    ctrl.logout = function () {
        ctrl.userService.logout();
    };
}]);

angular.module("myApp").directive("filesInput", function () {
    return {
        require: "ngModel",
        link: function postLink(scope, elem, attrs, ngModel) {
            elem.on("change", function (e) {
                var files = elem[0].files;
                ngModel.$setViewValue(files);
            })
        }
    }
});

app.filter('secondsToDateTime', [function () {
    return function (seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}]);
app.filter("trustUrl", ['$sce', function ($sce) {
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
}]);

