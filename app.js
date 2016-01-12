var moment = require('moment');
var jsonServer = require("./JsonServer.js")
var _ = require('underscore')
var uuid = require('uuid');

var sessions = [];

function Session(data, socket) {
	this.data = {};
	this.data.clientinfo = data;
	this.data.id = uuid.v4();
	this.data.startTime = moment().unix();
	this.data.endTime = 0;
	this.data.lastping = moment().unix();
	this.data.fps = [];
	this.data.features = [];
	this.data.tunnels = [];
	this.socket = socket;
	this.send = function (id, data) {
		var combined = { "id" : id, "data" : data };
		data = JSON.stringify(combined);
		buffer = new Buffer(4);
		buffer.writeUInt32LE(data.length);
		socket.write(buffer);
		socket.write(data, 0, data.length, 'binary');
	}
};

jsonServer.bind('session/start', function (req, res) {
	var session = new Session(req.data, res.socket);
	req.socket.session = session;
	session.socket = req.socket;
	sessions.push(session);
	res.send("session/start", "ok");
});

jsonServer.bind('session/report', function (req, res) {
	req.socket.session.data.fps.push({ 'time' : (moment().unix() - req.socket.session.data.startTime), 'fps' : req.data.fps });
});

jsonServer.bind('session/enable', function (req, res) {
	req.socket.session.data.features = req.socket.session.data.features.concat(req.data);
	req.socket.session.data.features = req.socket.session.data.features.filter(function (item, pos) { return req.socket.session.data.features.indexOf(item) == pos });
});

jsonServer.bind('session/list', function (req, res) {
	res.send("session/list", sessions.map(function (s) { return s.data; }));
});

jsonServer.close(function (socket) {
	sessions.splice(sessions.indexOf(socket.session), 1);
});


jsonServer.bind('tunnel/create', function (req, res) {
	for (var i = 0; i < sessions.length; i++) {
		var s = sessions[i];
		if (s.data.id == req.data.session) {
			if (s.data.features.indexOf("tunnel") < 0) {
				console.log("Trying to create a tunnel to a session that does not support tunneling");
				continue;
			}
			
			var t =  {
				"id" : uuid.v4(),
				"other" : req.socket.session
			};
			s.data.tunnels.push(t);
			s.send("tunnel/connect", { 'id' : t.id, "other" : req.socket.session.data.id });
			console.log("Created tunnel :)");
			res.send("tunnel/create", { 'status' : 'ok', 'id' : t.id });
			return;
		}
	}
	console.log("Session not found");
	res.send("tunnel/create", { 'status' : 'error' });
});

jsonServer.bind('tunnel/send', function (req, res) {
	for (var i = 0; i < sessions.length; i++) {
		var s = sessions[i];
		for (var ii = 0; ii < s.data.tunnels.length; ii++) {
			var t = s.data.tunnels[ii];
			if (t.id == req.data.dest) {
				if (req.socket.session == s)
					t.other.send('tunnel/send', { "id" : t.id, "data" : req.data.data });
				else
					s.send('tunnel/send', { "id" : t.id, "data" : req.data.data });

				return;
			}
		}
	}
	console.log("Could not find tunnel " + req.data.dest);
});



jsonServer.start(6666);
console.log("server running at port 6666\n");



var express = require('express');
var app = express();
app.get('/', function (req, res) {
	res.json(sessions.map(function (s) { return s.data; } ));
});

var server = app.listen(1337, function () {
	var host = server.address().address;
	var port = server.address().port;
	
	console.log('Webserver at http://%s:%s', host, port);
});