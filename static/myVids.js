var app = angular.module('myApp');
var server = app.config['server'];

app.controller('myVidsCtrl', ['$http', '$location','$mdToast', 'userService', function ($http, $location,$mdToast, userService) {
    var ctrl = this;

    ctrl.Service = userService;

    ctrl.init = function () {
        // Refresh user data:
        ctrl.Service.login(ctrl.Service.User.email, ctrl.Service.User.password);
    };

    ctrl.getVideos = function () {
        return ctrl.Service.User.videosData;
    };
    ctrl.getVideoThumbNail = function (video_id){
    var img_id = video_id.replace(".mp4",".png");
    return "https://cfvtes9c07.blob.core.windows.net/image-container/"+img_id
    };


    ctrl.removeVideoFromSystem = function (video_id, index) {
          if(confirm("Are you sure want to delete this video? ")) {
             ctrl.Service.User.videosData.splice(index,1);
         $http.get(server + '/removeVideoFromSystem?vid=' + encodeURI(video_id)).then(function (result) {
        }).catch(function (err) {
            var toast = $mdToast.simple().textContent('Error').action('OK').highlightAction(true).position('bottom right');

            $mdToast.show(toast).then(function (response) {
                if (response === 'ok')
                    $mdDialog.hide()
            });
        });
          }
    };

}]);