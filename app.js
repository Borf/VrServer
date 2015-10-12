jsonServer = require("./JsonServer.js")


jsonServer.bind('session/start', function (req, res) {
	console.log(req);
});

jsonServer.start(5000);
console.log("server running at port 5000\n");