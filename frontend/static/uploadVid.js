var app = angular.module('myApp');

app.controller('uploadVidCtrl', ['$http', '$scope', function ($http, $scope)
{
    var ctrl = this;
    ctrl.hello = 'uploadVidCtrl is up';

    ctrl.upload = function ()
    {
        var url = server + '/video';
        upload({
            url: url,
            method: 'POST',
            data: {
                video: $scope.videoFile,
                name: ctrl.videoName,
                description: ctrl.videoDescription
            }
        }).then(function (response)
        {
            window.alert('done');
        });
    }
}]);