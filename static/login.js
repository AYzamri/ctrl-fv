var app = angular.module('myApp');
var server = app.config['server'];

app.controller('loginCtrl', ['$http', '$location', 'userService', function ($http, $location, userService)
{
    var ctrl = this;

    ctrl.login = function ()
    {
        userService.login(ctrl.email, ctrl.password).then(function ()
        {
            $location.path('/#')
        })
    }
}]);