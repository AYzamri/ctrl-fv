var app = angular.module('myApp');
var containerUrl = "https://cfvtes9c07.blob.core.windows.net/videoscontainer";
var server = app.config['server'];
app.controller('watchVidCtrl', ['$http', '$scope', '$routeParams', function ($http, $scope, $routeParams)
{
    var ctrl = this;
    ctrl.vidId = $routeParams.vidId;
    ctrl.hello = 'watchVidCtrl is up';
    ctrl.currentVideoPath = containerUrl + "/" + ctrl.vidId + ".mp4";

    $http.get(server + '/invertedIndex?vidid=' + ctrl.vidId).then(function (index)
    {
        ctrl.invertedIndex = index.data;
    }).catch(function (err)
    {
        window.alert(err);
    });

    ctrl.searchVal = "";
    ctrl.search_results = [];

    ctrl.jump = function (res)
    {
        var video = document.getElementById("currentVideo");
        video.currentTime = res.startTime;
    };
    ctrl.searchInVid = function ()
    {
        ctrl.search_results = JSON.parse(ctrl.invertedIndex[ctrl.searchVal]);
    };

}]);
app.filter('secondsToDateTime', [function ()
{
    return function (seconds)
    {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}]);
app.filter("trustUrl", ['$sce', function ($sce)
{
    return function (recordingUrl)
    {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
}]);