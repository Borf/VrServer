//import required libs

const _ = require('lodash');
const ErrorHandler = require('../../lib/error.handler');
const SuccessHandler = require('../../lib/success.handler');
const User = require('./model')

var request = require('request');
var path = require("path");
var express = require("express");
var oauthSignature = require("oauth-signature");

    // Home page for oauth
    exports.index = function (req, res) {
        getOAuthToken(res); //
        //res.sendFile(path.join(__dirname + '/views/index.html'));
    }

    // callback for oauth
    exports.callback = function (req, res) {
        User.findOne({
            token: req.query.oauth_token
        })
            .then(function (user) {
                if (!user) {
                    return ErrorHandler.handle(res, new Error('Not found'), 404);
                }
                // get the access token
                var oauth_token = req.query.oauth_token; //token returned from saml
                var oauth_verifier = req.query.oauth_verifier; //verifier returned from saml
                var baseURL = 'https://publicapi.avans.nl/oauth/access_token';
                var key = '17f48ee9e866d30bd4f4bdbce3f5e2c7b292ddab';
                var secret = '6ab1750c99cfdaf73d6c198f3e9a4a3511ff15a2';
                var timestamp = Math.floor(new Date() / 1000);  //parses latest datetime to a timestamp
                var nonce = generateNonce();
                var signMethod = 'HMAC-SHA1';
                //list with parameters required for generating a signature
                var parameters = {
                    oauth_consumer_key: key,
                    oauth_nonce: nonce,
                    oauth_timestamp: timestamp,
                    oauth_signature_method: signMethod,
                    oauth_token: oauth_token,
                    oauth_verifier: oauth_verifier,
                    oauth_version: '1.0'
                };
                var signature = oauthSignature.generate('GET', baseURL, parameters, secret, user.token_secret, { encodeSignature: false }); //generates a signature using the oauth-signature library
                var url = (baseURL + '?oauth_consumer_key=' + key + '&oauth_signature_method=' + signMethod + '&oauth_timestamp=' + timestamp +
                    '&oauth_nonce=' + nonce + '&oauth_signature=' + signature + '&oauth_version=1.0&oauth_token=' + oauth_token + '&oauth_verifier=' + oauth_verifier); //create url with required parameters
                request.get(url, function (error, response, body) { //request access token
                    if (body.startsWith("oauth_problem")) { //return error when oauth failed
                        console.log(body);
                        res.send(body);
                    }
                    else {
                        var accessData = parseURLToJSON(body);
                        var userJson = { user_id: 1, token: data.oauth_token, token_secret: data.oauth_token_secret };
                        User
                            .create(userJson)
                            .then(function (user) {
                                getAvansAPIData("https://publicapi.avans.nl/oauth/studentnummer/", accessData.oauth_token_secret, accessData.oauth_token, function (studentString) {
                                    console.log(studentString);
                                    if (studentString.startsWith("oauth_problem")) {
                                        res.send(studentString);
                                    }
                                    else {
                                        var studentData = JSON.parse(studentString);
                                        User.findOne({ studentnr: studentData[0].studentnr }, function (err, doc) {
                                            doc.username = studentData[0].inlognaam;
                                            doc.studentnr = studentData[0].studentnummer;
                                            doc.token = oauth_token;
                                            doc.token_secret = user.token_secret;
                                            doc.user_id = '1';
                                            doc.save();
                                            res.send('Authorization complete oauth_token: ' + doc.token); //res.sendFile(path.resolve('./views/authorized.html'));
                                        });
                                        var userJson = { user_id: 1, token: data.oauth_token, token_secret: data.oauth_token_secret, studentnr: studentData[0].studentnummer, username: studentData[0].inlognaam };
                                        User
                                            .create(userJson)
                                            .then(function (user) {
                                                res.send('Authorization complete oauth_token: ' + doc.token); //res.sendFile(path.resolve('./views/authorized.html'));
                                            }, function (error) {
                                                ErrorHandler.handle(res, error, 422);
                                            });
                                    }
                                });
                            }, function (error) {
                                ErrorHandler.handle(res, error, 422);
                            });
                    }
                });
            }, function (error) {
                ErrorHandler.handle(res, error, 404);
            });
    }

    exports.validateLogin = function (req, res) {
        User.findOne({ token: req.query.oauth_token }, function (err, doc) {
            res.send({ studentnr: doc.studentnr });
        });
    }

    function getAvansAPIData(baseURL, token_secret, oauth_token, callback) {
        var key = '17f48ee9e866d30bd4f4bdbce3f5e2c7b292ddab';
        var secret = '6ab1750c99cfdaf73d6c198f3e9a4a3511ff15a2';
        var timestamp = Math.floor(new Date() / 1000);  //parses latest datetime to a timestamp
        var nonce = generateNonce();
        var signMethod = 'HMAC-SHA1';
        //list with parameters required for generating a signature
        var parameters = {
            oauth_consumer_key: key,
            oauth_nonce: nonce,
            oauth_timestamp: timestamp,
            oauth_signature_method: signMethod,
            oauth_token: oauth_token,
            oauth_version: '1.0'
        };
        var signature = oauthSignature.generate('GET', baseURL, parameters, secret, token_secret, { encodeSignature: false }); //generates a signature using the oauth-signature library
        var url = (baseURL + '?oauth_consumer_key=' + key + '&oauth_signature_method=' + signMethod + '&oauth_timestamp=' + timestamp +
            '&oauth_nonce=' + nonce + '&oauth_signature=' + signature + '&oauth_version=1.0&oauth_token=' + oauth_token); //create url with required parameters
        request.get(url, function (error, response, body) { //request access token
            console.log(body);
            callback(body);
        });
    }

    //oauth function
    function getOAuthToken(res) {
        //define required parameter variables
        var baseURL = 'https://publicapi.avans.nl/oauth/request_token';
        var key = '17f48ee9e866d30bd4f4bdbce3f5e2c7b292ddab';
        var secret = '6ab1750c99cfdaf73d6c198f3e9a4a3511ff15a2';
        var callback = 'http://127.0.0.1:1337/v1/oauth/callback';
        var nonce = generateNonce();
        var timestamp = Math.floor(new Date() / 1000); //parses latest datetime to a timestamp
        var signMethod = 'HMAC-SHA1';
        //list with parameters required for generating a signature
        var parameters = {
            oauth_consumer_key: key,
            oauth_nonce: nonce,
            oauth_timestamp: timestamp,
            oauth_signature_method: signMethod,
            oauth_callback: callback,
            oauth_version: '1.0'
        };
        var token = '';

        var signature = oauthSignature.generate('GET', baseURL, parameters, secret, token, { encodeSignature: false }); //generates a signature using the oauth-signature library
        var url = (baseURL + '?oauth_consumer_key=' + key + '&oauth_signature_method=' + signMethod + '&oauth_timestamp=' + timestamp +
            '&oauth_nonce=' + nonce + '&oauth_version=1.0&oauth_signature=' + signature + '&oauth_callback=' + callback); //create url with required parameters
        //get request_token and redirect to avans login page
        request.get(url, function (error, response, body) {
            console.log(body);
            data = parseURLToJSON(body);
            var userJson = { user_id: 1, token: data.oauth_token, token_secret: data.oauth_token_secret };
            User
                .create(userJson)
                .then(function (user) {
                    redirect(body, res);
                }, function (error) {
                    ErrorHandler.handle(res, error, 422);
                });
        });
    }

    //parses url encoded strings to json objects
    function parseURLToJSON(string) {
        var oauthData = {};
        var oauthToken;
        var parameters = string.split('&');
        //loop through and parse parameters
        for (var i = 0; i < parameters.length; i++) {
            pair = parameters[i].split('=');
            oauthData[pair[0]] = pair[1];
        }
        return oauthData;
    }

    //redirect to oauth page using data found in the api
    function redirect(data, res) {
        oauthData = parseURLToJSON(data);
        if (oauthData != undefined && oauthData.hasOwnProperty('oauth_problem')) { //return oauth failed when failed
            res.send('oauth failed: ' + data);
        }
        else if (oauthData != undefined) {

            res.redirect('https://publicapi.avans.nl/oauth/saml.php?oauth_token=' + oauthData.oauth_token); //redirects to saml (avans) login page when request for request token is successful
        }
        else {
            res.send('internal server error: ' + data);
        }
    }

    //function for generating a random nonce
    function generateNonce() {
        var nonce = '';
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 6; i++)
            nonce += possible.charAt(Math.floor(Math.random() * possible.length));

        return nonce;
    }

    //custom compare function used by the old oauth signature function
    function custom_compare(a, b) {
        var iets = a.parameter.localeCompare(b.parameter);
        return iets;
    }

    //currently using the oauth-signature library instead of this function
    function generateSignature(parameters, method, url, consumerSecret, tokenSecret) {
        parameters.sort(custom_compare);

        var parameterString = '';
        if (parameters.length > 0) {
            parameterString += (parameters[0].parameter + '=' + parameters[0].value);
            parameters.shift();
        }

        for (var i = 0; i < parameters.length; i++) {
            parameterString += ('&' + parameters[i].parameter + '=' + parameters[i].value);
        }

        baseString = method.toUpperCase() + '&' + encodeURIComponent(url) + '&' + encodeURIComponent(parameterString);

        var hash = CryptoJS.HmacSHA1(baseString, consumerSecret + '&' + tokenSecret);
        return CryptoJS.enc.Base64.stringify(hash);
    }