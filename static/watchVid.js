var app = angular.module('myApp');
var containerUrl = "https://cfvtes9c07.blob.core.windows.net/videoscontainer";
var server = app.config['server'];
app.controller('watchVidCtrl', ['$http', '$scope', '$routeParams', function ($http, $scope, $routeParams) {
    var ctrl = this;
    ctrl.vidId = $routeParams.vidId;
    ctrl.currentVideoPath = containerUrl + "/" + ctrl.vidId;
    ctrl.indexLoaded = false;

    // Start updating until all index up-to-date:
    ctrl.init = function () {
        ctrl.vidId = $routeParams.vidId;
        ctrl.currentVideoPath = containerUrl + "/" + ctrl.vidId;
        ctrl.indexLoaded = false;
        ctrl.updateInvertedIndex_Recursive();
    };

    ctrl.updateInvertedIndex_Recursive = function () {
        return $http.get(server + '/invertedIndex?vidid=' + ctrl.vidId).then(function (res) {
            ctrl.invertedIndex = res.data.index;
            ctrl.progress = res.data.progress;
            if (Object.keys(ctrl.invertedIndex).length > 0)
                ctrl.indexLoaded = true;

            if ('totalSegments' in ctrl.progress && !('range' in ctrl))
            {
                ctrl.range = [];
                // I honestly couldn't find a better way to calculate range
                for (var i = 0; i < ctrl.progress.totalSegments; i++)
                    ctrl.range.push(i);
            }

            if (window.location.pathname.includes(ctrl.vidId) && (
                !('totalSegments' in ctrl.progress) ||
                !('analyzedSegments' in ctrl.progress) ||
                ctrl.progress.totalSegments !== Object.keys(ctrl.progress.analyzedSegments).length))
                return setTimeout(ctrl.updateInvertedIndex_Recursive, 3000)
        }).catch(function (err) {
            window.alert('Error importing inverted index');
        });
    };

    ctrl.searchVal = "";
    ctrl.search_results = [];

    ctrl.jump = function (time) {
        var video = document.getElementById("currentVideo");
        video.currentTime = Math.max(time - 2, 0);
    };
    ctrl.searchInVid = function () {
        if (!ctrl.invertedIndex[ctrl.searchVal])
            ctrl.search_results = {};
        else
            ctrl.search_results = ctrl.invertedIndex[ctrl.searchVal];
    };

}]);
