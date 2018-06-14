var app = angular.module('myApp');
var server = app.config['server'];

app.controller('myVidsCtrl', ['$http', '$location', '$mdToast', '$scope', 'userService', 'headerService', function ($http, $location, $mdToast, $scope, userService, headerService) {
    var ctrl = this;
    headerService.model.showHeader = true;
    ctrl.retrievedVideos = false;
    ctrl.Service = userService;

    ctrl.init = function () {
        // Refresh user data:
        ctrl.Service.login(ctrl.Service.User.email, ctrl.Service.User.password).then(function (value) {
            ctrl.retrievedVideos = true;
        });
    };

    ctrl.getVideos = function () {
        return ctrl.Service.User.videosData;
    };

    ctrl.removeVideoFromSystem = function (video_id, index) {
        if (confirm("Are you sure want to delete this video? "))
        {
            ctrl.Service.User.videosData.splice(index, 1);
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

    $scope.test = 'test!!!!';
    $scope.getIfOverflow = function (id) {
        if (document.readyState !== "complete")
        {
            return false;
        }
        var e = document.getElementById(id);
        return (e.offsetWidth < e.scrollWidth);
    }
}]);