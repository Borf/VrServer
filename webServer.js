//Webserver
exports.start = function(sessions) {
    var express = require('express');
    var morgan = require('morgan');
    var cookieParser = require('cookie-parser');
    var session = require('express-session');
    var FileStore = require('session-file-store')(session);
    var app = express();
    var bodyParser = require('body-parser');
    var multer = require('multer');
    var upload = multer();
    var request = require('request');
    const path = require('path');
    const routes = require('./routes');
    const mongoose = require('mongoose');
    const config = require('./config');

    //activate libraries
    app.use(morgan('short'));
    app.use(cookieParser());
    app.use(session({
        name : 'connect.sid',
        secret: 'asdasd',
        resave: true,
        store: new FileStore(),
        saveUninitialized: false,
        cookie: { secure : false, httpOnly : false }
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use('/', routes);

    app.get('/', function (req, res) {
        res.json(sessions.map(function (s) { return s.data; } ));
    });

    mongoose.connect(config.MONGO_CONFIG);
    mongoose.set('debug', false);

    app.get('/availableApplications', function (req, res) {
        res.send('not implemented yet');
    });

    ////post request
    //app.post('/sendReports', upload.array(), function (req, res, next) {
    //    res.send(req.body); //use req.body for getting post json data
    //});

    var server = app.listen(1337, function () {
        var host = server.address().address;
        var port = server.address().port;
	
        console.log('Webserver at http://%s:%s', host, port);
    });
};
