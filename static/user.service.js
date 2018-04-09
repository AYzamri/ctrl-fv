var app = angular.module('myApp');
var server = app.config['server'];

app.factory('userService', ['$http', function ($http)
{
    var service = {};
    service.User = {username: 'Guest'};
    service.model = {};
    service.model.loggedIn = false;
    var url = server;


    service.signup = function (user)
    {
        return $http.post(url + '/signup', user).then(function (isUnique)
        {
            if(isUnique.data==="true"){
                service.User = user;
                service.mode.logggedIn = true;
            }
            return Promise.resolve(isUnique);
        }).catch(function (err)
        {
            return Promise.reject(err);
        })
    };

    service.login = function (email, password)
    {
        var userToSend = {email: email, password: password};
        return $http.post(url + '/login', userToSend).then(function (response)
        {
            service.User = response.data;
            service.model.loggedIn = true;
            return Promise.resolve();
        }).catch(function (err)
        {
            return Promise.reject(err);
        })
    };

    return service;
}]);