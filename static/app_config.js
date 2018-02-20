var app = angular.module('myApp');

var server = 'https://cfvtest.azurewebsites.net';
var localhost = 'http://localhost:5000';
var videoURL = "https://cfvtes9c07.blob.core.windows.net/videoscontainer";

app.config['server'] = server;
app.config['videoURL'] = videoURL;