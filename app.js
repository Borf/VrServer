net = require('net');
var clients = [];

net.createServer(function (socket) {
	socket.name = socket.remoteAddress + ":" + socket.remotePort
	socket.buffer = "";
	clients.push(socket);
	console.log(socket.name + " Connected.\n");
	
	socket.on('data', function (data) {
		socket.buffer += data;
		while(socket.buffer.length >= 4) {
			var len = new Buffer(socket.buffer, 4).readUInt32LE(0);
			if (socket.buffer.length >= 4 + len) {
				var packet = JSON.parse(socket.buffer.slice(4, len + 4));
				console.log(packet);
				socket.buffer = socket.buffer.slice(4 + len);
			} else
				break;

		}

	});
	socket.on('end', function () {
		clients.splice(clients.indexOf(socket), 1);
		console.log(socket.name + " Disconnected.\n");
	});
	
	function broadcast(message, sender) {
		clients.forEach(function (client) {
			if (client === sender) return;
			client.write(message);
		});
		process.stdout.write(message);
	}

}).listen(5000);

console.log('Node JS Version: ' + process.version);
console.log("server running at port 5000\n");