'use strict';

module.exports = class Response {
    constructor (socket) {
        this.socket = socket;
    }

    // Send a JSON message with data and id
    send (id, data) {
        let combined = { 'id' : id, 'data' : data };
        data = JSON.stringify(combined);
        let sizeBuffer = new Buffer(4);
        sizeBuffer.writeUInt32LE(data.length,0);
        this.socket.write(sizeBuffer);
        this.socket.write(data, 0, data.length, 'binary');
    }

    // Send a JSON message with any structure.
    sendData (data) {
        let jsonData = JSON.stringify(data);
        let sizeBuffer = new Buffer(4);
        sizeBuffer.writeUInt32LE(jsonData.length, 0);
        this.socket.write(sizeBuffer);
        this.socket.write(jsonData, 0, jsonData.length, 'binary');
    }
};
