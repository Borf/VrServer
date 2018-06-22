module.exports = function (app) {

    let path = require('path');
    let express = require('express');
    let oauthSignature = require('oauth-signature');
    
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

    //oauth function pls ignore everything from here and below
    function getOAuthToken(res) {
        let baseURL = 'https://publicapi.avans.nl/oauth/request_token';
        let key = '17f48ee9e866d30bd4f4bdbce3f5e2c7b292ddab';
        let secret = '6ab1750c99cfdaf73d6c198f3e9a4a3511ff15a2';
        let callback = 'http://127.0.0.1:8080/callback';
        let nonce = 'Du0x1J'; //generateNonce();
        let timestamp = 1496756772; //Math.floor(new Date() / 1000);
        let signMethod = 'HMAC-SHA1';
        let parameters = {
            oauth_consumer_key: key,
            oauth_nonce: nonce,
            oauth_timestamp: timestamp,
            oauth_signature_method: signMethod,
            oauth_callback: callback,
            oauth_version: '1.0'
        };
        let token = '';
        //parameters.push({ parameter: 'oauth_consumer_key', value: key });
        //parameters.push({ parameter: 'oauth_callback', value: callback });
        //parameters.push({ parameter: 'oauth_nonce', value: nonce });
        //parameters.push({ parameter: 'oauth_timestamp', value: timestamp });
        //parameters.push({ parameter: 'oauth_signature_method', value: signMethod });
        //parameters.push({ parameter: 'oauth_version', value: '1.0' });
        let signature = oauthSignature.generate('GET', baseURL, parameters, secret, token, { encodeSignature: false });//generateSignature(parameters, 'GET', baseURL, secret, token);
        res.send(signature);
        //let url = (baseURL + '?oauth_consumer_key=' + key + '&oauth_signature_method=' + signMethod + '&oauth_timestamp=' + timestamp +
        //    '&oauth_nonce=' + nonce + '&oauth_version=1.0&oauth_signature=' + signature + '&oauth_callback=' + callback);
        //request.get(url, function (error, response, body) {
        //    res.send(body);
        //});
    }

    function generateNonce() {
        let nonce = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < 6; i++)
            nonce += possible.charAt(Math.floor(Math.random() * possible.length));

        return nonce;
    }

    function custom_compare(a, b) {
        let iets = a.parameter.localeCompare(b.parameter);
        return iets;
    }

    function generateSignature(parameters, method, url, consumerSecret, tokenSecret) {
        parameters.sort(custom_compare);

        let parameterString = '';
        if (parameters.length > 0) {
            parameterString += (parameters[0].parameter + '=' + parameters[0].value);
            parameters.shift();
        }

        for (let i = 0; i < parameters.length; i++) {
            parameterString += ('&' + parameters[i].parameter + '=' + parameters[i].value);
        }

        let baseString = method.toUpperCase() + '&' + encodeURIComponent(url) + '&' + encodeURIComponent(parameterString);

        let hash = CryptoJS.HmacSHA1(baseString, consumerSecret + '&' + tokenSecret);
        return CryptoJS.enc.Base64.stringify(hash);
    }
};