var app = angular.module('myApp');
var server = app.config['server'];

app.controller('uploadVidCtrl', ['$http', '$scope', '$interval', 'upload', 'userService', function ($http, $scope, $interval, upload, userService) {
    var ctrl = this;
    ctrl.isUploading = false;
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
        ctrl.progress = 0;

        function refreshProgress()
        {
            $interval(function () {
                if (ctrl.isUploading)
                {
                    var progress = speedSummary.getCompletePercent();
                    ctrl.progress = Math.ceil(progress);
                }
                else
                    $interval.cancel();
            }, 1000);
        }

        // If one file has been selected in the HTML file input element
        var file = ctrl.vidArray[0];
        var fileName = ctrl.videoName + '.mp4';

        var blobUri = 'https://' + 'cfvtes9c07' + '.blob.core.windows.net';
        var sas = '?sv=2017-07-29&ss=b&srt=sco&sp=rwac&se=2018-03-20T18:02:46Z&st=2018-03-20T10:02:46Z&spr=https&sig=YVrkCOS7ynYhLTG2GBJjEhUH9ff1%2FPPQ1rlhWhxnLvM%3D';
        var blobService = AzureStorage.Blob.createBlobServiceWithSas(blobUri, sas);

        var customBlockSize = file.size > 1024 * 1024 * 32 ? 1024 * 1024 * 4 : 1024 * 512;
        blobService.singleBlobPutThresholdInBytes = customBlockSize;

        var finishedOrError = false;
        ctrl.isUploading = true;
        var speedSummary = blobService.createBlockBlobFromBrowserFile('videoscontainer', fileName, file, {blockSize: customBlockSize}, function (error, result, response) {
            ctrl.isUploading = false;
            if (error)
            {
                window.alert(error)
            }
            else
            {
                window.alert('success!')
            }
        });
        refreshProgress();
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