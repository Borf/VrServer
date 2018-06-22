module.exports = class Client {
    constructor(socket, id, master = false) {
        this.socket = socket;
        // The master client is the client who was the original creator of the
        // id dictionary.
        this.master = master;
        this.id = id;
        this.lastMesage = null;
    }
};
