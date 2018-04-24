var app = angular.module('myApp');
var server = app.config['server'];

app.controller('myVidsCtrl', ['$http', '$location', 'userService', function ($http, $location, userService) {
    var ctrl = this;

    ctrl.Service = userService;

    ctrl.init = function () {
        // Refresh user data:
        ctrl.Service.login(ctrl.Service.User.email, ctrl.Service.User.password);
    };

    ctrl.getVideos = function () {
        return ctrl.Service.User.videosData;
    }
    ctrl.getVideoThumbNail = function (video_id){
    var img_id = video_id.replace(".mp4",".png")
    return "https://cfvtes9c07.blob.core.windows.net/image-container/"+img_id
    }

}]);