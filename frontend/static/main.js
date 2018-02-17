var app = angular.module('myApp', ['lr.upload']);
app.config(['$interpolateProvider', function ($interpolateProvider)
{
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}]);
app.config(function ($routeProvider)
{
    $routeProvider.when("/",
        {
            templateUrl: "index.html"
        }).when("/upload", {
        templateUrl: "uploadvid.html"
    });
});

var server = 'https://cfvtest.azurewebsites.net/';
var localhost = 'http://localhost:5000';

app.config['server'] = localhost;
var mainCtrl = app.controller('mainCtrl', ['$scope', '$http', function ($scope, $http)
{
    var ctrl = this;
    ctrl.name = 'Ctrl-FV!';
}]);

