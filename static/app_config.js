var app = angular.module('myApp', ['ngRoute', 'lr.upload']);

var server = 'https://cfvtest.azurewebsites.net/';
var localhost = 'http://localhost:5000';

app.config['server'] = server;