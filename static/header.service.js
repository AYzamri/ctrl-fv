var app = angular.module('myApp');

app.factory('headerService', ['$http','$location', function ($http, $location) {
    var service = {};
    service.model = {};
    service.model.showHeader = false;
    return service;
}]);