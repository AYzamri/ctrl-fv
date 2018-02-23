var server = app.config['server'];

app.controller('myVidsCtrl', ['$http', '$location', 'userService', function ($http, $location, userService)
{
    var ctrl = this;

    ctrl.User = userService.User;

    ctrl.getVideos = function ()
    {
        return ctrl.User.videosData;
    }

}]);