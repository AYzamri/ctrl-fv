var app = angular.module('myApp', ['lr.upload']);
app.config(['$interpolateProvider', function($interpolateProvider) {
                    $interpolateProvider.startSymbol('[[');
                    $interpolateProvider.endSymbol(']]');
            }]);

var url = 'https://cfvtest.azurewebsites.net/';
var localhost = 'http://localhost:5000';

//url=localhost
var mainCtrl = app.controller('myCtrl', ['$scope','$http', function($scope,$http) {
              var ctrl = this;
              ctrl.url = url;
              ctrl.name = 'Ctrl-FV!';
              ctrl.messages = [];

              $http.get(url+'/messages').then(function(data){
                    ctrl.messages = data['data'];});

              ctrl.enqueue = function(){
                var data = {message : btoa(ctrl.message)}
                $http.post(ctrl.url+'/enqueue',data);
              }

              }]);

