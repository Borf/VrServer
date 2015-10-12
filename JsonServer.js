net = require('net');
var clients = [];

var callbacks = {};

exports.bind = function (name, callback) {
	callbacks[name] = callback;	
}


exports.start = function (port) {
	net.createServer(function (socket) {
		socket.name = socket.remoteAddress + ":" + socket.remotePort
		socket.buffer = "";
		socket.setEncoding("binary");
		clients.push(socket);
		console.log(socket.name + " Connected.\n");
		
		socket.on('data', function (data) {
			socket.buffer += data;
			while (socket.buffer.length >= 4) {
				var len = new Buffer(socket.buffer, "binary").readUInt32LE(0);
				if (socket.buffer.length >= 4 + len) {
					var packet = JSON.parse(socket.buffer.slice(4, len + 4));
					if (packet.hasOwnProperty("id") && callbacks.hasOwnProperty(packet.id))
						callbacks[packet.id](packet, null);
					else {
						console.log("Got invalid packet");
						if (packet.hasOwnProperty("id")) {
							console.log("Packet: " + packet.id);
							console.log(packet);
						}
						socket.end();
						socket.destroy();
					}
					socket.buffer = socket.buffer.slice(4 + len);
				} else
					break;
			}
		});
		socket.on('end', function () {
			clients.splice(clients.indexOf(socket), 1);
			console.log(socket.name + " Disconnected.\n");
		});
		socket.on('close', function () {
			clients.splice(clients.indexOf(socket), 1);
			console.log(socket.name + " Closed.\n");
		});
		socket.on('error', function () {
			clients.splice(clients.indexOf(socket), 1);
			console.log(socket.name + " Errored.\n");
		});
		
		function broadcast(message, sender) {
			clients.forEach(function (client) {
				if (client === sender) return;
				client.write(message);
			});
			process.stdout.write(message);
		}

	}).listen(port);
}
