var moment = require('moment');
var jsonServer = require('./JsonServer.js');
var _ = require('underscore');
var uuid = require('uuid');

var sessions = [];

class Session {
    constructor (data, socket) {
        this.data = {};
        this.data.clientinfo = data;
        this.data.id = uuid.v4();
        this.data.startTime = moment().unix();
        this.data.endTime = 0;
        this.data.lastping = moment().unix();
        this.data.fps = [];
        this.data.features = [];
        this.tunnels = [];
        this.tunnelkey = '';
        this.socket = socket;
        this.send = function (id, data) {
            var combined = { 'id' : id, 'data' : data };
            data = JSON.stringify(combined);
            let buffer = new Buffer(4);
            buffer.writeUInt32LE(data.length,0);
            socket.write(buffer);
            socket.write(data, 0, data.length, 'binary');
        };
    }
}

function sendSocket(socket, id, data) {
    var combined = { 'id' : id, 'data' : data };
    data = JSON.stringify(combined);
    let buffer = new Buffer(4);
    buffer.writeUInt32LE(data.length, 0);
    socket.write(buffer);
    socket.write(data, 0, data.length, 'binary');
}

jsonServer.bind('session/start', function (req, res) {
    var s = new Session(req.data, res.socket);
    req.socket.session = s;
    // session.socket = req.socket;
    sessions.push(s);
    res.send('session/start', 'ok');
});

jsonServer.bind('session/report', function (req, res) {
    req.socket.session.data.fps.push({ 'time' : (moment().unix() - req.socket.session.data.startTime), 'fps' : req.data.fps });
});

jsonServer.bind('session/enable', function (req, res) {
//	console.log("Got enable request for feature: " + req.data);
    req.socket.session.data.features = req.socket.session.data.features.concat(req.data);
    req.socket.session.data.features = req.socket.session.data.features.filter(function (item, pos) { return req.socket.session.data.features.indexOf(item) == pos; });
    if (req.key) {
        console.log('Enabling tunnel key');
        req.socket.session.tunnelkey = req.key;
    }
});

jsonServer.bind('session/list', function (req, res) {
    res.send('session/list', sessions.map(function (s) { return s.data; }));
});

jsonServer.close(function (socket) {
    console.log('Cleaning up tunnels');

    if (socket.session && socket.session.tunnels)
        for (let i = 0; i < socket.session.tunnels.length; i++)
            sendSocket(socket.session.tunnels[i].other, 'tunnel/close', { 'id' : socket.session.tunnels[i].id });

    if(sessions.indexOf(socket.session) != -1)
        sessions.splice(sessions.indexOf(socket.session), 1);

    for (let i = 0; i < jsonServer.clients.length; i++) {
        if (jsonServer.clients[i].session) {
            var s = jsonServer.clients[i].session;
            for (var ii = 0; ii < s.tunnels.length; ii++) {
                if (s.tunnels[ii].other == socket) {
                    s.tunnels.splice(ii, 1);
                    console.log('Cleaned up a tunnel...');
                }
            }

        }
    }

});


jsonServer.bind('tunnel/create', function (req, res) {
    for (var i = 0; i < sessions.length; i++) {
        var s = sessions[i];
        if (s.data.id == req.data.session) {
            if (s.data.features.indexOf('tunnel') < 0) {
                console.log('Trying to create a tunnel to a session that does not support tunneling');
                continue;
            }
            if (s.tunnelkey != '') {
                if (!req.data.key || req.data.key != s.tunnelkey) {
                    console.log('Trying to create a tunnel with an invalid key');
                    console.log('Tunnelkey = ' + s.tunnelkey);
                    if(req.data.key)
                        console.log('Key tried = ' + req.data.key);
                    continue;
                }
            }

            var t =  {
                'id' : uuid.v4(),
                'other' : req.socket
            };
            s.tunnels.push(t);
            s.send('tunnel/connect', { 'id' : t.id });
            console.log('Created tunnel :)');
            res.send('tunnel/create', { 'status' : 'ok', 'id' : t.id });
            return;
        }
    }
    console.log('Session with id \'' + req.data.session + '\' not found');
    res.send('tunnel/create', { 'status' : 'error' });
});

jsonServer.bind('tunnel/send', function (req, res) {
    for (var i = 0; i < sessions.length; i++) {
        var s = sessions[i];
        for (var ii = 0; ii < s.tunnels.length; ii++) {
            var t = s.tunnels[ii];
            if (t.id == req.data.dest) {
                if (req.socket.session == s)
                    sendSocket(t.other, 'tunnel/send', { 'id' : t.id, 'data' : req.data.data });
                else
                    s.send('tunnel/send', { 'id' : t.id, 'data' : req.data.data });

                return;
            }
        }
    }
    console.log('Could not find tunnel ' + req.data.dest);
});


jsonServer.start(6666);
console.log('server running at port 6666\n');


//Webserver
function startWebServer() {
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
}

