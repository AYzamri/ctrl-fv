var app = angular.module('myApp');
var containerUrl = "https://cfvtes9c07.blob.core.windows.net/videoscontainer";
var server = app.config['server'];
app.controller('watchVidCtrl', ['$http', '$scope', '$routeParams', function ($http, $scope, $routeParams)
{
    var ctrl = this;
    ctrl.vidId = $routeParams.vidId;
    ctrl.hello = 'watchVidCtrl is up';
    ctrl.currentVideoPath = containerUrl + "/" + ctrl.vidId;
    ctrl.indexLoaded = false;

    $http.get(server + '/invertedIndex?vidid=' + ctrl.vidId).then(function (index)
    {
        ctrl.invertedIndex = index.data;
        ctrl.indexLoaded = true;
    }).catch(function (err)
    {
        window.alert('Error importing inverted index');
    });

    ctrl.searchVal = "";
    ctrl.search_results = [];

    ctrl.jump = function (time)
    {
        var video = document.getElementById("currentVideo");
        video.currentTime = Math.max(time - 2, 0);
    };
    ctrl.searchInVid = function ()
    {
        if (!ctrl.invertedIndex[ctrl.searchVal])
            ctrl.search_results = {};
        else
            ctrl.search_results = ctrl.invertedIndex[ctrl.searchVal];
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