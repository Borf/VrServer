const net = require('net');
const Response = require('./Response');

var clients = [];
var callbacks = {};
let closeCallbacks = [];

exports.clients = clients;

exports.bind = function (name, callback) {
    callbacks[name] = callback;	
};

exports.close = function(callback)
{
    closeCallbacks.push(callback);
};

exports.start = function (port) {
    net.createServer(function (socket) {
        socket.name = socket.remoteAddress + ':' + socket.remotePort;
        socket.buffer = '';
        socket.setEncoding('binary');
        clients.push(socket);
        console.log(socket.name + ' Connected.');
		
        socket.on('data', function (data) {
            socket.buffer += data;
            while (socket.buffer.length >= 4) {
                var len = new Buffer(socket.buffer, 'binary').readUInt32LE(0);
                if (socket.buffer.length >= 4 + len) {
                    try {
                        var packet = JSON.parse(socket.buffer.slice(4, len + 4));
                    } catch(e)
                    {
                        console.log('Error parsing json...closing');
                        console.log(socket.buffer.slice(4,len+4));
                        break;
                    }
                    if (packet.hasOwnProperty('id') && callbacks.hasOwnProperty(packet.id)) {
                        //console.log("Got packet " + packet.id + "\n");
                        packet.socket = socket;
                        callbacks[packet.id](packet, new Response(socket));
                    }
                    else {
                        console.log('Got invalid packet');
                        if (packet.hasOwnProperty('id')) {
                            console.log('Packet: ' + packet.id);
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
            if(clients.indexOf(socket) < 0) return;
            closeCallbacks.forEach((callback) => {
                callback(socket);
            });
            console.log(socket.name + ' Disconnected. (index ' + clients.indexOf(socket) + ')\n');
            clients.splice(clients.indexOf(socket), 1);
        });
        socket.on('close', function () {
            if(clients.indexOf(socket) < 0) return;
            closeCallbacks.forEach((callback) => {
                callback(socket);
            });
            clients.splice(clients.indexOf(socket), 1);
            console.log(socket.name + ' Closed.\n');
        });
        socket.on('error', function (error) {
            console.log(socket.name + ' Errored.\n');
            closeCallbacks.forEach((callback) => {
                callback(socket);
            });
            clients.splice(clients.indexOf(socket), 1);
        });
		
        
    }).listen(port);
};

exports.broadcast = function broadcast(message, sender) {
    clients.forEach(function (client) {
        if (client === sender) return;

        let response = new Response(client);
        response.sendData(message);
    });
};
