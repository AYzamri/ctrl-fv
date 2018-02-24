var app = angular.module('myApp');
var server = app.config['server'];

app.controller('uploadVidCtrl', ['$http', '$scope', 'upload', 'userService', function ($http, $scope, upload, userService)
{
    var ctrl = this;
    ctrl.url = server + '/video';

    ctrl.hello = 'uploadVidCtrl is up';
    $scope.validateVidFile = function(element) {
        $scope.$apply($scope.validateFile(".mp4",element));
    };
    $scope.validateTranscriptFile = function(element) {
        $scope.$apply($scope.validateFile(".txt",element));
    };
    $scope.validateFile = function(fileExtension,element) {
                            $scope.theFile = element.files[0];
                            var FileMessage = '';
                            var filename = $scope.theFile.name;
                            var index = filename.lastIndexOf(".");
                            var strsubstring = filename.substring(index, filename.length);
                            if (strsubstring !== fileExtension ){
                                $scope.theFile = '';
                                FileMessage = 'Please upload correct File, File extension should be '+fileExtension;
                            }
                            else{
                                $scope.FileMessage = '';
                            }
                            if(fileExtension==".mp4"){
                                $scope.VideoFileMessage = FileMessage;
                            }
                            if(fileExtension==".txt"){
                                $scope.TranscriptFileMessage = FileMessage;
                            }

    };
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
        }, function (error)
        {
            window.alert('Error uploading video')
        })
    }
}]);