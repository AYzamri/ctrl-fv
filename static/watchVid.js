var app = angular.module('myApp');
var containerUrl = "https://cfvtes9c07.blob.core.windows.net/videoscontainer";
var server = app.config['server'];
app.controller('watchVidCtrl', ['$http', '$scope', '$routeParams', function ($http, $scope, $routeParams) {
    var ctrl = this;
    ctrl.vidId = $routeParams.vidId;
    ctrl.hello = 'watchVidCtrl is up';
    ctrl.currentVideoPath = containerUrl + "/" + ctrl.vidId;
    ctrl.indexLoaded = false;

    ctrl.updateInvertedIndex_Recursive = function () {
        return $http.get(server + '/invertedIndex?vidid=' + ctrl.vidId).then(function (index) {
            ctrl.invertedIndex = index.data;
            if (ctrl.invertedIndex.size() > 0)
                ctrl.indexLoaded = true;
            // ToDo Add stop when index is complete
            return setTimeout(ctrl.updateInvertedIndex_Recursive(), 1000);
        }).catch(function (err) {
            window.alert('Error importing inverted index');
        });
    };

    // Start updating until all index up-to-date:
    ctrl.updateInvertedIndex_Recursive();

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
