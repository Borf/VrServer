const Node = require("./Node");
const Logger = require("./logger");

class Player {
    constructor(position, rotation) {
        this.position = position;
        this.rotation = rotation;
    }
}

module.exports = class ServerUpdate {
    constructor() {
        this.count = 0;
        this.playerCount = 0;
        this.objects = [];
        this.players = [];
    }

    addObject(obj) {
        this.objects.push(obj);
        this.count = this.objects.length;
    }

    addPlayer(position, rotation) {
        this.players.push(position, rotation);
        this.playerCount = this.players.length;
    }
};
