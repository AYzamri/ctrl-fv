var app = angular.module('myApp');
var containerUrl = "https://cfvtes9c07.blob.core.windows.net/videoscontainer";
var server = app.config['server'];
app.controller('watchVidCtrl', ['$http', '$scope', '$routeParams', function ($http, $scope, $routeParams)
{
    var ctrl = this;
    var vidId = $routeParams.vidId;
    ctrl.hello = 'watchVidCtrl is up';
    ctrl.currentVideoPath = containerUrl + "/" + vidId + ".mp4";

    $http.get(server + '/invertedIndex?vidid=' + vidId).then(function ()
    {

    });

    $scope.searchVal = "";
    $scope.search_results = [];
    $scope.dummyDict = {
        hello: [
            {startTime: 10, paragraph: "hello shaked hazon"},
            {startTime: 30, paragraph: "hello ron michaeli "},
            {startTime: 20, paragraph: "hello dan gleyzer "},
            {startTime: 250, paragraph: " Adam Zamri"}
        ],
        test: [
            {startTime: 30, paragraph: "shaked test  hazon"},
            {startTime: 50, paragraph: "ron test  michaeli "},
            {startTime: 70, paragraph: "dan test  gleyzer "},
            {startTime: 90, paragraph: "hello Adam Zamri"}
        ]
    };

    $scope.jump = function (res)
    {
        var video = document.getElementById("currentVideo");
        video.currentTime = res.startTime;
    };
    $scope.searchInVid = function ()
    {
        $scope.search_results = $scope.dummyDict[$scope.searchVal];
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