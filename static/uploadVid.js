var app = angular.module('myApp');
var server = app.config['server'];

app.controller('uploadVidCtrl', ['$http', '$scope', 'upload', 'userService', 'azureBlob', function ($http, $scope, upload, userService, azureBlob) {
    var ctrl = this;
    ctrl.url = server + '/video';

    ctrl.hello = 'uploadVidCtrl is up';
    $scope.validateVidFile = function (element) {
        $scope.$apply($scope.validateFile(".mp4", element));
    };
    $scope.validateTranscriptFile = function (element) {
        $scope.$apply($scope.validateFile(".txt", element));
    };
    $scope.validateFile = function (fileExtension, element) {
        $scope.theFile = element.files[0];
        var FileMessage = '';
        var filename = $scope.theFile.name;
        var index = filename.lastIndexOf(".");
        var strsubstring = filename.substring(index, filename.length);
        if (strsubstring !== fileExtension)
        {
            $scope.theFile = '';
            FileMessage = 'Please upload correct File, File extension should be ' + fileExtension;
        }
        else
        {
            $scope.FileMessage = '';
        }
        if (fileExtension == ".mp4")
        {
            $scope.VideoFileMessage = FileMessage;
        }
        if (fileExtension == ".txt")
        {
            $scope.TranscriptFileMessage = FileMessage;
        }

    };
    ctrl.doUpload = function () {
        var name = 'testBlob';
        var config = {
            baseUrl: 'https://cfvtes9c07.blob.core.windows.net/videoscontainer/' + name,
            sasToken: '?sv=2017-07-29&ss=b&srt=sco&sp=rwdac&se=2018-03-20T00:37:06Z&st=2018-03-19T16:37:06Z&spr=https&sig=c7eYQgZ6KCCKWxBx%2FtiisayNE7k1PrQoj2K82NSDqWg%3D',// Shared access signature querystring key/value prefixed with ?,
            file: ctrl.vidArray[0]// File object using the HTML5 File API,
            // progress: 'a',// progress callback function,
            // complete: 'a', // complete callback function,
            // error: 'a',// error callback function,
            // blockSize: 'a' // Use this to override the DefaultBlockSize,
        };
        azureBlob.upload(config);
        // upload({
        //     url: ctrl.url,
        //     method: 'POST',
        //     data: {
        //         video: ctrl.vidArray[0],
        //         videoName: ctrl.videoName,
        //         videoDescription: ctrl.videoDescription,
        //         transcript: ctrl.transArray[0],
        //         user: userService.User.email
        //     }
        // }).then(function () {
        //     window.alert('added video to archive')
        // }, function (error) {
        //     window.alert('Error uploading video')
        // })
    }
}]);