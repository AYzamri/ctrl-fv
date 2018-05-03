var app = angular.module('myApp');
var containerUrl = "https://cfvtes9c07.blob.core.windows.net/videoscontainer";
var server = app.config['server'];
app.controller('watchVidCtrl', ['$http', '$scope', '$routeParams', '$mdToast', function ($http, $scope, $routeParams, $mdToast)
{
    var ctrl = this;
    ctrl.vidId = $routeParams.vidId;
    ctrl.currentVideoPath = containerUrl + "/" + ctrl.vidId;
    ctrl.indexLoaded = false;
    ctrl.searchVal = "";
    ctrl.searchValCurrentTerms = [];
    ctrl.search_results = null;

    // Start updating until all index up-to-date:
    ctrl.init = function ()
    {
        ctrl.vidId = $routeParams.vidId;
        ctrl.currentVideoPath = containerUrl + "/" + ctrl.vidId;
        ctrl.indexLoaded = false;
        ctrl.showRealTimeProgress = false;
        ctrl.getVideoData();
        ctrl.updateInvertedIndex_Recursive();
    };

    ctrl.getVideoData = function ()
    {
        $http.get(server + '/videoData?vidid=' + ctrl.vidId).then(function (res)
        {
            ctrl.videoData = res.data;
        }, function (reason)
        {
            var toast = $mdToast.simple().textContent('Failed retrieving video data').action('OK').highlightAction(true).position('bottom right');

            $mdToast.show(toast).then(function (response)
            {
                if (response === 'ok')
                    $mdDialog.hide()
            });
        });
    };

    ctrl.updateInvertedIndex_Recursive = function ()
    {
        return $http.get(server + '/invertedIndex?vidid=' + ctrl.vidId).then(function (res)
        {
            ctrl.invertedIndex = res.data.index;
            ctrl.progress = res.data.progress;
            if (Object.keys(ctrl.invertedIndex).length > 0)
                ctrl.indexLoaded = true;

            if ('totalSegments' in ctrl.progress && !('range' in ctrl))
            {
                // Update video details to get the confidence
                ctrl.getVideoData();
                ctrl.range = [];
                // I honestly couldn't find a better way to calculate range
                for (var i = 0; i < ctrl.progress.totalSegments; i++)
                    ctrl.range.push(i);
            }

            if (window.location.href.includes(ctrl.vidId) && (
                !('totalSegments' in ctrl.progress) ||
                !('analyzedSegments' in ctrl.progress) ||
                ctrl.progress.totalSegments !== Object.keys(ctrl.progress.analyzedSegments).length))
            {
                ctrl.showRealTimeProgress = true;
                return setTimeout(ctrl.updateInvertedIndex_Recursive, 1000)
            }
            else
            {
                ctrl.showRealTimeProgress = false;
            }

        }).catch(function (err)
        {
            var toast = $mdToast.simple().textContent('Error importing inverted index').action('OK').highlightAction(true).position('bottom right');

            $mdToast.show(toast).then(function (response)
            {
                if (response === 'ok')
                    $mdDialog.hide()
            });
        });
    };

    ctrl.jump = function (time)
    {
        var video = document.getElementById("currentVideo");
        video.currentTime = Math.max(time - 2, 0);
    };

    ctrl.searchInVid = function ()
    {
        ctrl.searchValCurrentTerms = [];
        var searchResults = {};
        var searchTerms = ctrl.searchVal.split(" ");
        for (var i = 0; i < searchTerms.length; i++)
        {
            var term = searchTerms[i];
            term = term.toLowerCase();
            term = term.replace(/[^\w]|_/g, "");   // remove punctuation
            // Fuzz 'term' here
            if (!ctrl.invertedIndex[term])
                continue;
            ctrl.searchValCurrentTerms.push(term);
            searchResults = Object.assign(searchResults, ctrl.invertedIndex[term]);
        }
        ctrl.search_results = searchResults.length === 0 ? {} : sortAndCleanSearchResults(searchResults, 1);
    };

    ctrl.numberOfResults = function ()
    {
        return Object.keys(ctrl.search_results).length;
    };

    var sortAndCleanSearchResults = function (searchResults, threshold)
    {
        var sortedSearchResults = {};
        var prevKey = -1;
        Object.keys(searchResults).sort(function (key1, key2)
        {
            return key1.localeCompare(key2, "kn", {numeric: true})
        }).forEach(function (key)
        {
            if (prevKey === -1 || (key - prevKey) > threshold)
                sortedSearchResults[key] = searchResults[key];
            prevKey = key;
        });
        return sortedSearchResults;
    };
}]);
