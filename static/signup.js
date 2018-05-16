var app = angular.module('myApp');
var server = app.config['server'];

app.controller('signupCtrl', ['$http', '$location', '$mdToast', 'userService', 'headerService', function ($http, $location, $mdToast, userService, headerService) {
    var ctrl = this;
    headerService.model.showHeader = true;
    ctrl.user = {
        email: "",
        password: "",
        username: "",
        firstName: "",
        lastName: ""
    };

    ctrl.signup = function () {
        userService.signup(ctrl.user).then(function (isEmailUnique) {
            if (isEmailUnique.data === "true")
            {
                userService.login(ctrl.user.email, ctrl.user.password).then(function () {
                    $location.path('/')
                });
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