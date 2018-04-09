var app = angular.module('myApp');
var server = app.config['server'];

app.factory('userService', ['$http', 'localStorageService', function ($http, localStorageService) {
    var service = {};
    service.User = {username: 'Guest'};
    service.model = {};
    service.model.loggedIn = false;
    var url = server;


    service.signup = function (user) {
        return $http.post(url + '/signup', user).then(function (isUnique) {
            if (isUnique.data === "true")
            {
                service.User = user;
                service.mode.logggedIn = true;
                registerDataToLocalStorage();
            }
            return Promise.resolve(isUnique);
        }).catch(function (err) {
            return Promise.reject(err);
        })
    };

    service.login = function (email, password) {
        var userToSend = {email: email, password: password};
        return $http.post(url + '/login', userToSend).then(function (response) {
            service.User = response.data;
            service.model.loggedIn = true;
            registerDataToLocalStorage();
            return Promise.resolve();
        }).catch(function (err) {
            return Promise.reject(err);
        })
    };

    service.logout = function () {
        deleteDataFromLocalStorage();
        service.User = {username: 'Guest'};
        service.model.loggedIn = false;
    };

    var registerDataToLocalStorage = function () {
        localStorageService.add('CFVData', JSON.stringify(service.User));
    };

    var loadDataFromLocalStorageIfExists = function () {
        user_string = localStorageService.get('CFVData');
        if (user_string)
        {
            service.User = JSON.parse(user_string);
            service.model.loggedIn = true;
        }
    };

    var deleteDataFromLocalStorage = function () {
        localStorageService.remove('CFVData');
    };

    loadDataFromLocalStorageIfExists();
    return service;
}]);