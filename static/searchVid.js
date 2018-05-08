var app = angular.module('myApp');
var server = app.config['server'];

app.controller('searchVidCtrl', ['$http', '$scope', '$mdToast', function ($http, $scope, $mdToast)
{
    var ctrl = this;
    ctrl.searchVal = "";

    ctrl.searchForVid = function ()
    {
        ctrl.searchFinished = false;
        ctrl.vid_search_results = [];
        $http.get(server + '/searchForVideo?searchterm=' + encodeURI(ctrl.searchVal)).then(function (results)
        {
            ctrl.searchFinished = true;
            ctrl.vid_search_results = results.data;
        }).catch(function (err)
        {
            var toast = $mdToast.simple().textContent('Error finding videos').action('OK').highlightAction(true).position('bottom right');

            $mdToast.show(toast).then(function (response)
            {
                if (response === 'ok')
                    $mdDialog.hide()
            });
        });
    };

    ctrl.getNumberOfResults = function ()
    {
        return Object.keys(ctrl.vid_search_results).length;
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