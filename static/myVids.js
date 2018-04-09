var app = angular.module('myApp');
var server = app.config['server'];

app.controller('myVidsCtrl', ['$http', '$location', 'userService', function ($http, $location, userService) {
    var ctrl = this;

    ctrl.User = userService.User;

    ctrl.init = function () {
        // Refresh user data:
        userService.login(ctrl.User.email, ctrl.User.password);
    };

    ctrl.getVideos = function () {
        return ctrl.User.videosData;
    }

}]);