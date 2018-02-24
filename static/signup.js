var app = angular.module('myApp');
var server = app.config['server'];

app.controller('signupCtrl', ['$http', '$location', 'userService', function ($http, $location, userService)
{
    var ctrl = this;

    ctrl.user = {};

    ctrl.signup = function ()
    {
        userService.signup(ctrl.user).then(function (isEmailUnique)
        {
        if(isEmailUnique.data=="true"){
            $location.path('/')
        }
        else{
            window.alert('Email allready exists')
        }

        }).catch(function (err)
        {
            window.alert('Error signing up')
        });
    };
}]);