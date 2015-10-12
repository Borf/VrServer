var moment = require('moment');
var jsonServer = require("./JsonServer.js")
var _ = require('underscore')
var uuid = require('uuid');

var sessions = [];

function Session(data) {
	this.data = data;
	this.data.id = uuid.v4();
	this.data.startTime = moment().unix();
	this.data.endTime = 0;
	this.data.lastping = moment().unix();
	this.data.fps = [];
};

jsonServer.bind('session/start', function (req, res) {
	var session = new Session(req.data);
	req.socket.session = session;
	session.socket = req.socket;
	sessions.push(session);
	res.send("session/start", "ok");
});

jsonServer.bind('session/report', function (req, res) {
	req.socket.session.data.fps.push({ 'time' : (moment().unix() - req.socket.session.data.startTime), 'fps' : req.data.fps });
});

jsonServer.bind('session/list', function (req, res) {
	res.send("session/list", sessions.map(function (s) { return s.data; }));
});


jsonServer.start(5000);
console.log("server running at port 5000\n");



var express = require('express');
var app = express();
app.get('/', function (req, res) {
	res.json(sessions.map(function (s) { return s.data; } ));
});

var server = app.listen(1337, function () {
	var host = server.address().address;
	var port = server.address().port;
	
	console.log('Example app listening at http://%s:%s', host, port);
});