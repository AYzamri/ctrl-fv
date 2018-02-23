var app = angular.module('myApp');
var server = app.config['server'];

app.controller('searchVidCtrl', ['$http', '$scope', function ($http, $scope)
{
    var ctrl = this;
    ctrl.url = server + '/searchvid';
    $scope.searchVal = "change";

    var dummyDict = {
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
    $scope.vid_search_results = [
        {
            name: "Climate Change",
            id: "elec_22022018_1126.mp4"
        }

    ];
    ctrl.searchForVid = function ()
    {
        $http.get(server + '/searchForVideo?searchterm=change').then(function (index)
        {
            ctrl.test = index.data;
        }).catch(function (err)
        {
            window.alert(err);
        });
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