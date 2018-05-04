var app = angular.module('myApp');
var server = app.config['server'];

app.controller('loginCtrl', ['$http', '$location', '$mdToast', 'userService', function ($http, $location, $mdToast, userService) {
    var ctrl = this;

    ctrl.login = function () {
        userService.login(ctrl.email, ctrl.password).then(function () {
            $location.path('/')
        }).catch(function () {
            var toast = $mdToast.simple().textContent('Error logging in').action('OK').highlightAction(true).position('bottom right');

            $mdToast.show(toast).then(function (response) {
                if (response === 'ok')
                    $mdDialog.hide()
            });
        });
    }
}]);