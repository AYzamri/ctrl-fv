var app = angular.module('myApp');
var server = app.config['server'];

app.controller('uploadVidCtrl', ['$http', '$scope', 'upload', 'userService', function ($http, $scope, upload, userService)
{
    var ctrl = this;
    ctrl.url = server + '/video';

    ctrl.hello = 'uploadVidCtrl is up';

    ctrl.doUpload = function ()
    {
        upload({
            url: ctrl.url,
            method: 'POST',
            data: {
                video: ctrl.vidArray[0],
                videoName: ctrl.videoName,
                videoDescription: ctrl.videoDescription,
                transcript: ctrl.transArray[0],
                user: userService.User.email
            }
        }).then(function ()
        {
            window.alert('added video to archive')
        }).catch(function (error)
        {
            window.alert('Error uploading video')
        })
    }
}]);