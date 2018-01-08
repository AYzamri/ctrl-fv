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
}]);

var server = 'https://cfvtest.azurewebsites.net/';
var localhost = 'http://localhost:5000';

app.config['server'] = server;
app.controller('mainCtrl', ['$scope', '$http', function ($scope, $http)
{
    var ctrl = this;
    ctrl.name = 'Ctrl-FV!';
}]);

