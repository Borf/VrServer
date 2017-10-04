var request = require('request');
var path = require("path");
var express = require("express");
var oauthSignature = require("oauth-signature");
var querystring = require("querystring");

var key = '17f48ee9e866d30bd4f4bdbce3f5e2c7b292ddab';
var secret = '6ab1750c99cfdaf73d6c198f3e9a4a3511ff15a2';
var signMethod = 'HMAC-SHA1';
var uuid = require('uuid');


var sessions = [];


    // Home page for oauth
exports.index = function (req, res) {
    getOAuthToken(req, res); //
}

// callback for auth

exports.callback = function (req, res) {
	var baseURL = 'https://publicapi.avans.nl/oauth/access_token';
	var token = req.query.oauth_token;
	var verifier = req.query.oauth_verifier;
	var nonce = generateNonce();
	var timestamp = Math.floor(new Date() / 1000);
	
	var parameters = {
		oauth_consumer_key: key,
		oauth_nonce: nonce,
		oauth_signature_method: signMethod,
		oauth_timestamp: timestamp,
		oauth_token: token,
		oauth_verifier: verifier,
		oauth_version: '1.0'
	};
	var signature = oauthSignature.generate('GET', baseURL, parameters, secret, req.session.token_secret);//generateSignature(parameters, 'GET', baseURL, secret, token);
	
	var url = baseURL;
	url += "?oauth_consumer_key=" + key;
	url += "&oauth_nonce=" + nonce;
	url += "&oauth_signature_method=" + signMethod;
	url += "&oauth_timestamp=" + timestamp;
	url += "&oauth_token=" + token;
	url += "&oauth_verifier=" + verifier;
	url += "&oauth_signature=" + signature;
	url += "&oauth_version=1.0";
	
	request.get(url, function (error, response, body) {
		parameters = querystring.parse(body);
		if (parameters.oauth_token) {
			req.session.oauth_token = parameters.oauth_token;
			req.session.oauth_token_secret = parameters.oauth_token_secret;
			res.send('<script>window.location="http://localhost:1337/v1/oauth/finishlogin";</script>');
//			res.redirect("http://localhost:1337/v1/oauth/finishlogin");
		}
		else {
			res.send("Error logging in: <br/><br/>" + body);
		}

	});
}


exports.finishLogin = function (req, res) {
	callApi("https://publicapi.avans.nl/oauth/people/@me", req.session, function (data) {
		if (data) {
			var session = {
				id : uuid.v4(),
				key : uuid.v1(),
				name : data.name.formatted,
				email : data.emails[0],
				login : data.id
			}
			
			var loginData = {};
			loginData.sessionid = session.id;
			loginData.key = session.key;

			res.type("text/plain");
			res.send(loginData);
			sessions.push(session);
		}
		else
			res.send("something went wrong");
	});
}

exports.confirm = function (req, res) {
	console.log(req.body);
	console.log(sessions);
	for (var i in sessions) {
		if (sessions[i].id == req.body.sessionid && sessions[i].key == req.body.key && sessions[i].key != "") {
			res.send(sessions[i]);
			sessions[i].key = "";
			return;
		}
	}
	
	res.send("Error");
}

exports.validateLogin = function (req, res) {
    res.send('not implemented yet');  //send sends plain text
}

//oauth function
function getOAuthToken(req, res) {
    var baseURL = 'https://publicapi.avans.nl/oauth/request_token';
    var callback = 'http://localhost:1337/v1/oauth/callback';
    var nonce = generateNonce();
    var timestamp = Math.floor(new Date() / 1000);
    var parameters = {
        oauth_consumer_key: key,
        oauth_nonce: nonce,
        oauth_timestamp: timestamp,
        oauth_signature_method: signMethod,
        oauth_callback: callback,
        oauth_version: '1.0'
    };
    var token = '';
    var signature = oauthSignature.generate('GET', baseURL, parameters, secret, token);//generateSignature(parameters, 'GET', baseURL, secret, token);
    //res.send(signature);
    var url = (baseURL + '?oauth_consumer_key=' + key + '&oauth_signature_method=' + signMethod + '&oauth_timestamp=' + timestamp +
        '&oauth_nonce=' + nonce + '&oauth_version=1.0&oauth_signature=' + signature + '&oauth_callback=' + callback);
	request.get(url, function (error, response, body) {
		parameters = querystring.parse(body);
		req.session.token_secret = parameters.oauth_token_secret;
        redirect(body, res);
    });
}


function callApi(url, session, callback) {
	var baseURL = url;
	
	var timestamp = Math.floor(new Date() / 1000);
	var nonce = generateNonce();
	var parameters = {
		oauth_consumer_key: key,
		oauth_nonce: nonce,
		oauth_signature_method: signMethod,
		oauth_timestamp: timestamp,
		oauth_token: session.oauth_token,
	};
	
	var signature = oauthSignature.generate('GET', baseURL, parameters, secret, session.oauth_token_secret);//generateSignature(parameters, 'GET', baseURL, secret, token);
	
	var reqUrl = baseURL;
	reqUrl += "?oauth_consumer_key=" + key;
	reqUrl += "&oauth_signature=" + signature;
	reqUrl += "&oauth_signature_method=" + signMethod;
	reqUrl += "&oauth_nonce=" + nonce;
	reqUrl += "&oauth_timestamp=" + timestamp;
	reqUrl += "&oauth_token=" + session.oauth_token;
	
	request.get(reqUrl, function (error, response, body) {
		var js = null;
		try {
			js = JSON.parse(body);
		} catch (e) {
			console.log("Error parsing json: " + body);
		}
		callback(js);
	});	
}

//redirect to oauth page using data found in the api
function redirect(data, res) {
    var oauthData = {};
    var oauthToken;
    var parameters = data.split('&');
    for (var i = 0; i < parameters.length; i++) {
        pair = parameters[i].split('=');
        oauthData[pair[0]] = pair[1];
    }
    if (oauthData != undefined && oauthData.hasOwnProperty('oauth_problem')) {
        res.send('oauth failed: ' + data);
    }
    else if (oauthData != undefined) {

        res.send('<script>window.location="https://publicapi.avans.nl/oauth/saml.php?oauth_token=' + oauthData.oauth_token + '";</script>');
    }
    else {
        res.send('internal server error');
    }
}

function generateNonce() {
    var nonce = '';
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 32; i++)
        nonce += possible.charAt(Math.floor(Math.random() * possible.length));
    return nonce;
}