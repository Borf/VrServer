const uuid = require('uuid');
const moment = require('moment');
const mpServer = require('./crimeSceneMultiplayer/multiplayerServer');
let jsonServer = require('./JsonServer');


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

exports.start = function (sessions) {
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
        // throw new Error('sadsda');
        console.log('Cleanng up tunnels');

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

                if (req.broadcast) {
                    jsonServer.broadcast(req.data, req.socket);
                    return;
                }

                if (t.id == req.data.dest) {
                    if (req.socket.session == s) {
                        sendSocket(t.other, 'tunnel/send', { 'id' : t.id, 'data' : req.data.data });
                    } else {
                        s.send('tunnel/send', { 'id' : t.id, 'data' : req.data.data });
                    }

                    return;
                }
            }
        }
        console.log('Could not find tunnel ' + req.data.dest);
    });

    // Start the crimeScene multiplayer server
    mpServer.start(sessions, jsonServer);

    jsonServer.start(6666);
    console.log('server running at port 6666\n');

};

