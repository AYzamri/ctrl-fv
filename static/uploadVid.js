var app = angular.module('myApp');
var server = app.config['server'];

// Formate Date to DDMMYYYY_HHMM format
Date.prototype.idFormat = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [(dd > 9 ? '' : '0') + dd,
        (mm > 9 ? '' : '0') + mm,
        this.getFullYear()
    ].join('') + '_' + this.getHours() + this.getMinutes();
};

app.controller('uploadVidCtrl', ['$http', '$scope', '$interval', '$location', '$mdDialog', 'upload', 'userService','headerService',
    function ($http, $scope, $interval, $location, $mdDialog, upload, userService, headerService) {
        var ctrl = this;
        headerService.model.showHeader = true;
        ctrl.isUploading = false;
        ctrl.storageUrl = 'https://cfvtes9c07.blob.core.windows.net';
        ctrl.serverUrl = server + '/videoData';
        ctrl.videoDescription = "";
        ctrl.progress = 0;

        $scope.validateVidFile = function (element) {
            $scope.$apply($scope.validateFile(".mp4", element));
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
            if (fileExtension === ".mp4")
            {
                $scope.VideoFileMessage = FileMessage;
            }
            if (fileExtension === ".txt")
            {
                $scope.TranscriptFileMessage = FileMessage;
            }

        };

        ctrl.getDuration = function () {
            window.URL = window.URL || window.webkitURL;
            var file = document.getElementById('videoFile').files[0];
            var video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = function () {
                window.URL.revokeObjectURL(video.src);
                ctrl.duration = video.duration;
            };

            video.src = URL.createObjectURL(file);
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
                }, 200);
            }

            // If one file has been selected in the HTML file input element
            var file = ctrl.vidArray[0];
            var currentTime = new Date();
            var videoID = ctrl.videoName.replace(/ /g, "_") + '_' + currentTime.idFormat() + '.mp4';
            var req_body = {
                videoID: videoID,
                videoName: ctrl.videoName,
                videoDescription: ctrl.videoDescription,
                user: userService.User.email,
                duration: ctrl.duration,
                videoUrl: ctrl.storageUrl + "/videoscontainer/" + videoID
            };

            var sas = '?sv=2017-07-29&ss=bfqt&srt=co&sp=rwacup&se=2018-06-30T17:44:01Z&st=2018-04-03T09:44:01Z&spr=https&sig=cjTWXrIh5yrImi%2FddvbXyvxlk%2F0DVTbJPxJHqj%2BoGt0%3D';
            var blobService = AzureStorage.Blob.createBlobServiceWithSas(ctrl.storageUrl, sas);
            var customBlockSize = file.size > 1024 * 1024 * 32 ? 1024 * 1024 * 4 : 1024 * 512;
            blobService.singleBlobPutThresholdInBytes = customBlockSize;
            ctrl.isUploading = true;

            var speedSummary = blobService.createBlockBlobFromBrowserFile('videoscontainer', videoID, file, {blockSize: customBlockSize}, function (error, result, response) {
                    if (error)
                    {
                        $mdDialog.show({
                            template: alertDialogTemplate,
                            controller: DialogController,
                            controllerAs: "ctrl",
                            clickOutsideToClose: false,
                            bindToController: true,
                            locals: {error: error}
                        }).then(function () {
                            location.reload();
                        });
                    }
                    else
                        $http.post(ctrl.serverUrl, req_body).then(function () {
                            ctrl.isUploading = false;
                            $mdDialog.show({
                                template: successDialogTemplate,
                                controller: DialogController,
                                controllerAs: "ctrl",
                                clickOutsideToClose: false,
                                bindToController: true
                            }).then(function () {
                                $location.url('/watch/' + videoID)
                            });
                        }, function (reason) {
                            $mdDialog.show({
                                template: alertDialogTemplate,
                                controller: DialogController,
                                controllerAs: "ctrl",
                                clickOutsideToClose: false,
                                bindToController: true,
                                locals: {error: reason.data}
                            }).then(function () {
                                location.reload();
                            });
                        });
                }
            );
            refreshProgress();
        };
    }]);

//region Dialogs region
function DialogController($scope, $mdDialog)
{
    $scope.hide = function () {
        $mdDialog.hide();
    };
}

var successDialogTemplate = "<md-dialog aria-label=\"Upload Finished\">\n" +
    "  <form ng-cloak>\n" +
    "    <md-toolbar md-theme='blue'>\n" +
    "      <div class=\"md-toolbar-tools\">\n" +
    "        <h2>Video Uploaded Successfully</h2>\n" +
    "      </div>\n" +
    "    </md-toolbar>\n" +
    "\n" +
    "    <md-dialog-content>\n" +
    "      <div class=\"md-dialog-content\">\n" +
    "        <h4>\n" +
    "          You can now watch your video and in a few moments you will be able to search inside it" +
    "        </h4>\n" +
    "      </div>\n" +
    "    </md-dialog-content>\n" +
    "\n" +
    "    <md-dialog-actions layout=\"row\">\n" +
    "      <md-button ng-click=\"hide()\">\n" +
    "        Go To Video\n" +
    "      </md-button>\n" +
    "    </md-dialog-actions>\n" +
    "  </form>\n" +
    "</md-dialog>";

var alertDialogTemplate = "<md-dialog aria-label=\"Upload Failed\">\n" +
    "  <form ng-cloak>\n" +
    "    <md-toolbar md-theme='red'>\n" +
    "      <div class=\"md-toolbar-tools\">\n" +
    "        <h2>Error while uploading</h2>\n" +
    "      </div>\n" +
    "    </md-toolbar>\n" +
    "\n" +
    "    <md-dialog-content>\n" +
    "      <div class=\"md-dialog-content\">\n" +
    "        <h4>\n" +
    "          An error has occurred while uploading video.\nThe error: [[ctrl.error]]\n" +
    "        </h4>\n" +
    "      </div>\n" +
    "    </md-dialog-content>\n" +
    "\n" +
    "    <md-dialog-actions layout=\"row\">\n" +
    "      <md-button ng-click=\"hide()\">\n" +
    "        OK\n" +
    "      </md-button>\n" +
    "    </md-dialog-actions>\n" +
    "  </form>\n" +
    "</md-dialog>";
// endregion