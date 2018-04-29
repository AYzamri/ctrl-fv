var app = angular.module('myApp');
var server = app.config['server'];

app.controller('searchVidCtrl', ['$http', '$scope', function ($http, $scope) {
    var ctrl = this;
    ctrl.searchVal = "";
    ctrl.searchFinished = false;
    ctrl.vid_search_results = [];

    ctrl.searchForVid = function () {
        $http.get(server + '/searchForVideo?searchterm=' + encodeURI(ctrl.searchVal)).then(function (results) {
            ctrl.searchFinished = true;
            ctrl.vid_search_results = results.data;
        }).catch(function (err) {
            window.alert('Error finding videos');
        });
    };
    ctrl.getVideoThumbNail = function (video_id) {
        var img_id = video_id.replace(".mp4", ".png");
        return "https://cfvtes9c07.blob.core.windows.net/image-container/" + img_id
    };
    ctrl.getNumberOfResults = function () {
      return Object.keys(ctrl.vid_search_results).length;
    };


    // func app trigger
    // ctrl.searchForVid = function ()
    // {
    //     var searchDetails = {
    //                             searchKey: ctrl.searchVal
    //                         };
    //     var search_func_app_url = 'https://cfvtes.azurewebsites.net/api/Searcher?code=bk9rMU8Yv2bpvm97YDImhffQdLcmu1E' +
    //                                '/ksj7RFG1BJ3YeMRCZpaTQg=='
    //     $http.post(search_func_app_url, searchDetails).then(function (results)
    //     {
    //         ctrl.vid_search_results = results.data;
    //     }).catch(function (err)
    //     {
    //         window.alert('Error finding videos');
    //     });
    // };

}]);
app.filter('secondsToDateTime', [function () {
    return function (seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}]);
app.filter("trustUrl", ['$sce', function ($sce) {
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
}]);