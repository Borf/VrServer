const Node = require('./Node');

module.exports = class Update {
    constructor(client, data) {
        this.client = client;
        this.count = data.count;
        this.objects = [];
        this.requestNum = data.requestNumber;
        this._deserializePlayerPos(data);
        this._deserializeObjects(data);
    }

    getId() {
        return this.client.id;
    }

    _deserializePlayerPos(raw) {
        let buff = Buffer.from(raw.playerPosition, 'base64');
        let posArray = [];
        for (let i = 0; i < 3; i++) {
            posArray.push(buff.readFloatLE(i * 4));
        }

        this.playerPosition = posArray;
    }

    _deserializeObjects(raw) {
        let buff = Buffer.from(raw.objects, 'base64');

        for (let objIndex = 0; objIndex < this.count; objIndex++) {
            // One object is 32 bytes
            let id = buff.readInt32LE(objIndex * 32);
            let pos = [0, 0, 0];
            let rot = [0, 0, 0, 0];

            // rotation (4 floats = 16 bytes)
            for (let i = 0; i < 4; i++) {
                rot[i] = buff.readFloatLE(objIndex * 32 + 4);
            }

            // pos (3 floats = 12 bytes)
            for (let i = 0; i < 3; i++) {
                pos[i] = buff.readFloatLE(objIndex * 32 + 20);
            }

            this.objects.push(new Node(id, pos, rot));
        }
    }
};
