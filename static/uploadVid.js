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

app.controller('uploadVidCtrl', ['$http', '$scope', '$interval', '$location', '$mdDialog', '$log', 'upload', 'userService', 'headerService',
    function ($http, $scope, $interval, $location, $mdDialog, $log, upload, userService, headerService) {
        var ctrl = this;
        headerService.model.showHeader = true;
        ctrl.isUploading = false;
        ctrl.storageUrl = 'https://ctrlfvfunctionaa670.blob.core.windows.net';
        ctrl.serverUrl = server + '/videoData';
        ctrl.videoDescription = "";
        ctrl.progress = 0;
        ctrl.allowedFormats = [".flv", ".avi", ".mov", ".mp4", ".mpg", ".mpeg", ".wmv", ".3gp", ".mkv"];

        $scope.validateVidFile = function (element) {
            if (element.files.length < 1)
                return;
            $scope.$apply($scope.validateFile(ctrl.allowedFormats, element));
        };

        $scope.validateFile = function (allowedFormats, element) {
            $scope.theFile = element.files[0];
            var filename = $scope.theFile.name;
            var index = filename.lastIndexOf(".");
            var fileExtension = filename.substring(index, filename.length);
            if (!allowedFormats.includes(fileExtension))
            {
                element.value = "";
                $scope.FileMessage = 'Apparently this file is not a video. Please choose a video file.';
            }
            else
            {
                ctrl.fileExtension = fileExtension;
                $scope.FileMessage = '';
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
            $log.log(new Date().toLocaleTimeString() + ' Started Uploading File');

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
            var videoID = ctrl.videoName.replace(/ /g, "_") + '_' + currentTime.idFormat() + ctrl.fileExtension;
            var req_body = {
                videoID: videoID,
                videoName: ctrl.videoName,
                videoDescription: ctrl.videoDescription,
                user: userService.User.email,
                duration: ctrl.duration,
                videoUrl: ctrl.storageUrl + "/video-container/" + videoID
            };

            var sas = '?sv=2017-11-09&ss=b&srt=sco&sp=wac&se=2018-07-31T16:08:07Z&st=2018-05-01T08:08:07Z&spr=https&sig=OdyfmFGHA%2FzArZcy0JxM%2FgFtgq9hYk0Q2Fk45QnsnOE%3D';
            var blobService = AzureStorage.Blob.createBlobServiceWithSas(ctrl.storageUrl, sas);
            var customBlockSize = file.size > 1024 * 1024 * 32 ? 1024 * 1024 * 4 : 1024 * 512;
            blobService.singleBlobPutThresholdInBytes = customBlockSize;
            ctrl.isUploading = true;

            var speedSummary = blobService.createBlockBlobFromBrowserFile('video-container', videoID, file, {blockSize: customBlockSize}, function (error, result, response) {
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
                            $log.log(new Date().toLocaleTimeString() + ' Finished Uploading File');
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