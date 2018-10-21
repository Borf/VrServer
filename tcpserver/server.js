const net = require('net');
const { EventEmitter } = require('events');
const Sender = require('./sender');
const { Session } = require('./session');

/**
 * @typedef {net.Socket & {session: Session}} Socket
 */

class Server extends EventEmitter {
	constructor() {
		super();

		this._clients = [];
		
		/**
		 * A map of all callbacks
		 * @type {Map.<string, packetCallback>}
		 * @readonly
		 * @private
		 */
		this._callbacks = new Map();
		
		this._server = null;
	}

	/**
	 * Callback for receiving packets
	 * @callback packetCallback
	 * @param {Request} req The request
	 * @param {Response} res The response
	 */

	/**
	 * Binds to the specified packet id
	 * @param {string} id The packet id
	 * @param {packetCallback} callback The callback
	 */
	bind(id, callback) {
		this._callbacks.set(id, callback);
	}

	/**
	 * Starts the server at the specified port
	 * @param {number} port The port
	 */
    start(port) {
        this._server = net.createServer(
			this._setupSocket.bind(this)).listen(port);
		
		console.info(`[INFO]: Server is running on port ${port}`)
    }

	/**
	 * Sets up a socket
	 * @param {net.Socket} socket The socket
	 */
	_setupSocket(socket) {
		socket.name = `${socket.remoteAddress}:${socket.remotePort}`;
		socket.buffer = Buffer.from("", "binary");
		socket.setEncoding('binary');

		this._clients.push(socket);
		console.info(`[INFO]: ${socket.name} Connected`);

		socket.on('data', (data) => this._onSocketData(socket, data));
        
		socket.on('error', (error) => this._onSocketError(socket, error));
        
        socket.on('end', () => this._onSocketEnd(socket));

        socket.on('close', (hadError) => this._onSocketClose(socket, hadError));
	}

	/**
	 * 
	 * @param {net.Socket} socket The socket
	 * @param {Buffer} data The data sent
	 */
	_onSocketData(socket, data) {
		socket.buffer += data;

		while(socket.buffer.length >= 4) {

			const len = Buffer.from(socket.buffer, 'binary').readUInt32LE(0);
			if(socket.buffer.length >= len + 4) {
				try {
					const packet = JSON.parse(socket.buffer.slice(4, len + 4));
				
					if(!this._isValidPacket(packet)) {
						console.info(`[INFO]: ${socket.name} sent an invalid packet!`);
						
						if(packet.hasOwnProperty('id')) {
							console.debug('[DEBUG]: Invalid packet: ', packet);
						}
						
						//socket.end();
					} else {
						this._callbacks.get(packet.id)(new Request(socket, packet), new Response(socket));
					}
				} catch(e) {
					console.log(e);
					console.warn(`[WARN]: Failed to parse ${socket.buffer.slice(4, len + 4)}, parhaps it was not json?`);
				}
				socket.buffer = socket.buffer.slice(4 + len);
			} else {
				break;
			}
		}
    }
    
    _onSocketEnd(socket) {
        console.debug(`[DEBUG]: ${socket.name} ended`);
    }

    _onSocketClose(socket, hadError) {
		console.debug(`[DEBUG]: ${socket.name} closed, hadError: ${hadError}`);
		this._clients.splice(this._clients.indexOf(socket), 1);
        this.emit('close', socket);
    }

    /**
     * 
     * @param {net.Socket} socket The socket
     * @param {Error} error The error
     */
    _onSocketError(socket, error) {
        // If it aint a common error
        if(error.code !== "ECONNRESET") {
            console.error(`[ERROR]: ${socket.name} Had error,`, error);
        }
        
    }

	_isValidPacket(packet) {
		return packet.hasOwnProperty('id') && this._callbacks.has(packet.id);
	}

    close() {
		this._server.close();
    }
}

/**
 * @typedef {Object} Packet
 * @property {string} id
 * @property {object} data
 */

class Request {
	constructor(socket, packet) {
		/**
		 * The socket
		 * @type {Socket}
		 * @readonly
		 */
		this.socket = socket;

		/**
		 * The packet
		 * @type {Packet}
		 */
		this.packet = packet;
	}
}

class Response extends Sender {
	constructor(socket) {
		super(socket);
	}
}

module.exports = Server;
module.exports.Request = Request;
module.exports.Response = Response;