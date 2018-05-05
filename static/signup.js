var app = angular.module('myApp');
var server = app.config['server'];

app.controller('signupCtrl', ['$http', '$location', '$mdToast', 'userService', function ($http, $location, $mdToast, userService) {
    var ctrl = this;

    ctrl.user = {
    email:"",
    password:"",
    username:"",
    firstName:"",
    lastName:""
    };

    ctrl.signup = function () {
        userService.signup(ctrl.user).then(function (isEmailUnique) {
            if (isEmailUnique.data == "true")
            {
               var toast = $mdToast.simple().textContent('Signed Up Succesfully').action('OK').highlightAction(false).position('top');
                $mdToast.show(toast).then(function (response) {
                    if (response === 'ok')
                        $mdDialog.hide()
                });
                $location.path('/')
            }
            else
            {
                var toast = $mdToast.simple().textContent('Email already exists').action('OK').highlightAction(true).position('bottom right');

                $mdToast.show(toast).then(function (response) {
                    if (response === 'ok')
                        $mdDialog.hide()
                });
            }

        }).catch(function (err) {
            var toast = $mdToast.simple().textContent('Error signing up').action('OK').highlightAction(true).position('bottom right');

            $mdToast.show(toast).then(function (response) {
                if (response === 'ok')
                    $mdDialog.hide()
            });
        });
    };
}]);