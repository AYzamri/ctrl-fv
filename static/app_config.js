var app = angular.module('myApp');

var server = 'https://ctrl-fvideos.azurewebsites.net';
var localhost = 'http://localhost:5000';
var videoURL = "https://ctrlfvfunctionaa670.blob.core.windows.net/video-container";

// app.config['server'] = server;
app.config['server'] = localhost;
app.config['videoURL'] = videoURL;
