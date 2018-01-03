var app = angular.module('myApp', []);
app.config(['$interpolateProvider', function($interpolateProvider) {
                    $interpolateProvider.startSymbol('[[');
                    $interpolateProvider.endSymbol(']]');
            }]);

var url = 'https://cfvtest.azurewebsites.net/';
//var url = 'http://localhost:5000';
var mainCtrl = app.controller('myCtrl', ['$scope','$http', function($scope,$http) {
              var ctrl = this;
              ctrl.name = 'Ctrl-FV!';
              ctrl.messages = [];

              $http.get(url+'/messages').then(function(data){
                    ctrl.messages = data['data'];});

              ctrl.enqueue = function(){
                var data = {message : ctrl.message}
                $http.post(url+'/enqueue',data);
              }
              }]);

