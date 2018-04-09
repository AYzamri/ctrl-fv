var app = angular.module('myApp');
var server = app.config['server'];

app.controller('myVidsCtrl', ['$http', '$location', 'userService', function ($http, $location, userService) {
    var ctrl = this;

    ctrl.Service = userService;

    ctrl.init = function () {
        // Refresh user data:
        ctrl.Service.login(ctrl.User.email, ctrl.User.password);
    };

    ctrl.getVideos = function () {
        return ctrl.Service.User.videosData;
    }

}]);