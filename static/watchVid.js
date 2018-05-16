var app = angular.module('myApp');
var server = app.config['server'];

app.controller('watchVidCtrl', ['$http', '$scope', '$routeParams', '$mdToast', 'headerService', function ($http, $scope, $routeParams, $mdToast, headerService) {
    var ctrl = this;
    headerService.model.showHeader = true;
    ctrl.vidId = $routeParams.vidId;
    ctrl.indexLoaded = false;
    ctrl.searchVal = "";
    ctrl.searchValCurrentTerms = [];
    ctrl.search_results = null;
    ctrl.showRealTimeProgress = false;
    ctrl.wordCloudList = [];

    // Start updating until all index up-to-date:
    ctrl.init = function () {
        ctrl.getVideoData();
        ctrl.updateInvertedIndex_Recursive();
    };

    ctrl.getVideoData = function () {
        $http.get(server + '/videoData?vidid=' + ctrl.vidId).then(function (res) {
            ctrl.videoData = res.data;
            ctrl.setVideo();
        }, function (reason) {
            var toast = $mdToast.simple().textContent('Failed retrieving video data').action('OK').highlightAction(true).position('bottom right');

            $mdToast.show(toast).then(function (response) {
                if (response === 'ok')
                    $mdDialog.hide()
            });
        });
    };

    ctrl.setVideo = function () {
        var myPlayer = videojs('currentVideo');
        myPlayer.src(ctrl.videoData.video_url);
    };

    ctrl.updateInvertedIndex_Recursive = function () {
        return $http.get(server + '/invertedIndex?vidid=' + ctrl.vidId).then(function (res) {
            var myPlayer = videojs('currentVideo');
            if (myPlayer.poster === "")
            {
                try
                {
                    myPlayer.poster(ctrl.videoData.tn_url);
                }
                catch (err)
                {
                }
            }
            if (!ctrl.invertedIndex || Object.keys(ctrl.invertedIndex).length !== Object.keys(res.data.index).length)
            {
                ctrl.invertedIndex = res.data.index;
                ctrl.createWordCloud();
                ctrl.progress = res.data.progress;
                if (Object.keys(ctrl.invertedIndex).length > 0)
                    ctrl.indexLoaded = true;
            }

            if ('totalSegments' in ctrl.progress && !('range' in ctrl))
            {
                // Update video details to get the confidence
                ctrl.getVideoData();
                ctrl.range = [];
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

        }).catch(function (err) {
            var toast = $mdToast.simple().textContent('Error importing inverted index').action('OK').highlightAction(true).position('bottom right');

            $mdToast.show(toast).then(function (response) {
                if (response === 'ok')
                    $mdDialog.hide()
            });
        });
    };

    ctrl.jump = function (time) {
        var myPlayer = videojs('currentVideo');
        myPlayer.currentTime(Math.max(time - 2, 0));
    };

    ctrl.searchInVid = function () {
        ctrl.searchValCurrentTerms = [];
        var options = {
            includeScore: true,
            shouldSort: true, // Sort by score
            threshold: 0.25, // At what point does the match algorithm give up.
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: ["term"]
        };
        var fuseIndex = Object.keys(ctrl.invertedIndex).map(function (term) {
            return {'term': term, 'appearances': ctrl.invertedIndex[term]}
        });
        var fuse = new Fuse(fuseIndex, options);

        var searchResults = {};
        ctrl.showDidYouMean = false;
        var searchTerms = ctrl.searchVal.split(" ");
        for (var i = 0; i < searchTerms.length; i++)
        {
            var term = searchTerms[i];
            var results = fuse.search(term);
            if (results.length === 0)
                continue;
            var mostSuitingTerm = results[0].item;
            var bestScore = results[0].score;
            // Find the word with the max score & max appearances:
            for (var index in results)
            {
                var result = results[index].item;
                var score = results[index].score;
                // Results are sorted by score, so when we find a result with a worse score we can stop
                if (score < bestScore)
                    break;
                // Compare number of appearances and choose the word with more appearances
                if (Object.keys(result.appearances).length > Object.keys(mostSuitingTerm.appearances).length)
                    mostSuitingTerm = result;
            }
            if (term !== mostSuitingTerm.term)
                ctrl.showDidYouMean = true;
            ctrl.searchValCurrentTerms.push(mostSuitingTerm.term);
            searchResults = Object.assign(searchResults, mostSuitingTerm.appearances);
        }
        ctrl.search_results = searchResults.length === 0 ? {} : sortAndCleanSearchResults(searchResults, 1);

    };

    ctrl.isExist = function (word) {
        if (word[word.length - 1] === '.' || word[word.length - 1] === ',')
            word = word.slice(0, -1);
        return ctrl.searchValCurrentTerms.indexOf(word) > -1;
    };

    ctrl.createWordCloud = function () {
        var wordCloudCanvas = document.getElementById('my_canvas');
        var wordCloudDiv = document.getElementById('wordCloudDiv');
        wordCloudCanvas.width = wordCloudDiv.clientWidth;
        wordCloudCanvas.height = wordCloudDiv.clientHeight;
        var maxWordCount = 0;
        var wordCloudRaw = Object.entries(ctrl.invertedIndex).map(function (term) {
            var wordCount = Object.keys(term[1]).length;
            maxWordCount = wordCount >= maxWordCount ? wordCount : maxWordCount;
            return [term[0], wordCount]
        }).sort(Comparator);
        var numberOfWordsInWordCLoud = Math.floor(wordCloudRaw.length / 2);
        ctrl.wordCloudList = wordCloudRaw.slice(0, numberOfWordsInWordCLoud);
        WordCloud(wordCloudCanvas,
            {
                list: ctrl.wordCloudList,
                weightFactor: function (size) {
                    return scaleBetween(size, 1, 70, ctrl.wordCloudList[numberOfWordsInWordCLoud - 1][1], maxWordCount);
                }, gridSize: 2,
                shape: 'circle',
                click: function (data) {
                    ctrl.searchVal = data[0];
                    ctrl.searchInVid();
                    $scope.$apply();
                }
            })
        ;
    };

    ctrl.numberOfResults = function () {
        return Object.keys(ctrl.search_results).length;
    };

    $scope.$on("$destroy", function () {
        var oldPlayer = document.getElementById('currentVideo');
        videojs(oldPlayer).dispose();
    });

    var sortAndCleanSearchResults = function (searchResults, threshold) {
        var sortedSearchResults = {};
        var prevKey = -1;
        Object.keys(searchResults).sort(function (key1, key2) {
            return key1.localeCompare(key2, "kn", {numeric: true})
        }).forEach(function (key) {
            if (prevKey === -1 || (key - prevKey) > threshold)
                sortedSearchResults[key] = searchResults[key];
            prevKey = key;
        });
        return sortedSearchResults;
    };
}]);

function scaleBetween(oldValue, minFontSize, maxFontSize, min, max)
{
    return newValue = (oldValue - min) / (max - min) * (maxFontSize - minFontSize) + minFontSize;
}

function Comparator(a, b)
{
    if (a[1] < b[1]) return 1;
    if (a[1] > b[1]) return -1;
    return 0;
}

app.filter('split', function () {
    return function (input, splitChar, splitIndex) {
        var splitted = input.split(splitChar);
        if (splitIndex >= 0) return splitted[splitIndex];
        return splitted[splitted.length + splitIndex];
    }
});

var format = function (format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
};

app.filter('datetostring', function () {
    return function (input) {
        var str = ["{0}{1}-{2}{3}-{4}{5}{6}{7}"];
        var splitted = input.split("");
        var args = str.concat(splitted);
        return format.apply(this, args);
    }
});

