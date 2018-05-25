const Node = require("./Node");
const Logger = require("./logger")();

module.exports = class Update {
    constructor(client, data) {
        this.client = client;
        this.count = data.count;
        this.objects = [];
        this.requestNum = data.requestNumber;
        this.playerPosition = [0, 0, 0];
        this.playerRotation = [0, 0, 0, 0];
        this._deserializePlayerData(data);
        this._deserializeObjects(data);
    }

    getId() {
        return this.client.id;
    }

    _deserializePlayerData(raw) {
        try {
            let buff = Buffer.from(raw.playerPosition, "base64");
            for (let i = 0; i < 3; i++) {
                this.playerPosition[i] = buff.readFloatLE(i * 4);
            }
        } catch (error) {
            Logger.log(`Failed to get player position: ${error}`);
        }

        try {
            let buffRot = Buffer.from(raw.playerRotation, "base64");
            for (let i = 0; i < 4; i++) {
                this.playerRotation[i] = buffRot.readFloatLE(i * 4);
            }
        } catch (error) {
            Logger.log(`Failed to get player rotation: ${error}`);
        }
    }

    _deserializeObjects(raw) {
        let buff = Buffer.from(raw.objects, "base64");

        for (let objIndex = 0; objIndex < this.count; objIndex++) {
            try {
                // One object is 32 bytes
                let id = buff.readInt32LE(objIndex * 32);
                let pos = [0, 0, 0];
                let rot = [0, 0, 0, 0];

                // rotation (4 floats = 16 bytes)
                for (let i = 0; i < 4; i++) {
                    rot[i] = buff.readFloatLE((objIndex * 32) + 4 + (i * 4));
                }

                // pos (3 floats = 12 bytes)
                for (let i = 0; i < 3; i++) {
                    pos[i] = buff.readFloatLE((objIndex * 32) + 20 + (i * 4));
                }

                this.objects.push(new Node(id, pos, rot));
            } catch (error) {
                Logger.log(`failed to get object: ${error}`);
            }
        }
    }
};
