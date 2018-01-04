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
              ctrl.current = 0;
              ctrl.total = 0;

              ctrl.enqueue = function(){
                var data = {message : btoa(ctrl.message)}
                $http.post(ctrl.url+'/enqueue',data);
              }

              setInterval(function(){
              $http.get(url+'/messages').then(function(data){
                                  ctrl.messages = data['data'];});
              $http.get(url+'/progress').then(function(data){
              ctrl.current = data.data['current'];
              ctrl.total = data.data['total']})
              },10000)

              }]);

