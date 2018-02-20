var app = angular.module('myApp');
var server = app.config['server'];

app.controller('uploadVidCtrl', ['$http', '$scope', 'upload', function ($http, $scope, upload)
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
                transcript: ctrl.transArray[0]
            }
        }).then(function ()
        {
            window.alert('added video to archive')
        }).catch(function (error)
        {
            window.alert(error.message)
        })
    }
}]);