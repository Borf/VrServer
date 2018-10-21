const { Socket } = require('net');

class Sender {
    /**
     * Creates a new sender instance
     * @param {Socket} socket The socket
     */
    constructor(socket) {

        /**
         * The client socket
         * @type {Socket}
         * @readonly
         * @private
         */
        this._socket = socket;
    }

    /**
     * A helper method to send data using the socket
     * @param {string} id The packet id
     * @param {*} data The data to send
     */
    send(id, data) {
        if(this._socket.destroyed) {
            console.warn(`[WARN]: Tried to send something to a destroyed socket!`);
            return;
        }

        const response = JSON.stringify({
            id, data
        });

        const buffer = Buffer.alloc(4);
        buffer.writeUInt32LE(response.length, 0)
        
        this._socket.write(buffer);
        this._socket.write(response, 0, data.length, 'binary');
    }
}

module.exports = Sender;