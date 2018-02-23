var app = angular.module('myApp');
var server = app.config['server'];

app.controller('loginCtrl', ['$http', '$scope', 'userService', function ($http, $scope, userService)
{
    var ctrl = this;

    ctrl.login = function ()
    {
        userService(ctrl.email, ctrl.password).then(function ()
        {
            // Go To other page
        })
    }
}]);