module.exports = class JsonUpdate {
    constructor(client, data) {
        this.client = client;
        
        this.count = data.count;
        this.objects = data.objects;
        this.requestNum = data.requestNum;
        this.playerPosition = data.playerPosition;
        this.playerRotation = data.playerRotation;
    }

    getId() {
        return this.client.id;
    }
};
