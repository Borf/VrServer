module.exports = function (app) {

    var path = require("path");
    var express = require("express");
    
    // Home page for oauth
    app.get('/v1/oauth', function (req, res) {
        getOAuthToken(res); //
        //res.sendFile(path.join(__dirname + '/views/index.html'));
    });

    // callback for auth

    app.get('/v1/callback', function (req, res) {
        res.sendFile(path.resolve('./views/authorized.html')); //sendfile sends html page
    });

    app.get('/v1/validateLogin', function (req, res) {
        res.send('not implemented yet');  //send sends plain text
    });

}