const Node = require("./Node");
const Logger = require("./logger");

class Player {
    constructor(id, position, rotation) {
        this.id = id;
        this.position = position;
        this.rotation = rotation;
    }
}

class Object {
    constructor(id, rot, pos) {
        this.id = id;
        this.rot = rot;
        this.pos = pos;
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

    addPlayer(id, position, rotation) {
        this.players.push(new Player(id, position, rotation));
        this.playerCount = this.players.length;
    }

    toJson() {
        let obj = {
            count: this.count,
            playerCount: this.playerCount,
            players: [],
            objects: []
        };

        this.players.forEach((player) => {
            obj.players.push(new Object(player.id, player.rotation, player.position));
        });
        this.objects.forEach((object) => {
            obj.objects.push(new Object(object.id, object.rotation, object.position));
        });
        // Players
        // this.players.forEach((player) => {
        //     let binPlayer = "";

        //     // Id
        //     let idArray = Int32Array.from([player.id]);
        //     let idBytes = new Int8Array(idArray.buffer);
        //     binPlayer += Buffer.from(idBytes).toString();

        //     // rotation
        //     let rotationArray = Float32Array.from([player.rotation]);
        //     let rotationBytes = new Int8Array(rotationArray.buffer);
        //     binPlayer += Buffer.from(rotationBytes).toString();

        //     // position
        //     let positionArray = Float32Array.from([player.position]);
        //     let positionBytes = new Int8Array(positionArray.buffer);
        //     binPlayer += Buffer.from(positionBytes).toString();
        
        //     obj.players += Buffer.from(binPlayer).toString("base64");
        // });

        // // Objects
        // this.objects.forEach((object) => {
        //     let binObject = "";

        //     // Id 
        //     let idArray = Int32Array.from([object.id]);
        //     let idBytes = new Int8Array(idArray.buffer);
        //     binObject += Buffer.from(idBytes).toString();

        //     // rotation
        //     let rotationArray = Float32Array.from([object.rotation]);
        //     let rotationBytes = new Int8Array(rotationArray.buffer);
        //     binObject += Buffer.from(rotationBytes).toString();

        //     // position
        //     let positionArray = Float32Array.from([object.position]);
        //     let positionBytes = new Int8Array(positionArray.buffer);
        //     binObject += Buffer.from(positionBytes).toString();

        //     obj.objects += Buffer.from(binObject).toString("base64");
        // });

        return obj;
    }
};
