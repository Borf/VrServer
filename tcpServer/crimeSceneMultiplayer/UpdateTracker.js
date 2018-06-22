const ServerUpdate = require("./ServerUpdate");

module.exports = class UpdateTracker {
    constructor() {
        this.inputBuffer = [];
        this.prevData = null;
        this.clientIds = [];
    }

    addData(data) {
        this.inputBuffer.push(data);
    }

    // Get the most recen update for every client.
    _getRecentData(clientCount) {
        let inputData = this.inputBuffer.splice(0, this.inputBuffer.length);
        let clientData = {};

        for (let i = inputData.length - 1; i >= 0; i--) {
            const currentClient = inputData[i].client;
            const currentId = currentClient.id.toString();

            if (!this.clientIds.includes(currentId)) {
                this.clientIds.push(currentId);
                clientData[currentId] = inputData[i];
                // Don't continue looping if we already have data on ever client
                if (this.clientIds.length >= clientCount) {
                    break;
                }
            }
        }

        return clientData;
    }

    _buildData(clientData) {
        let update = new ServerUpdate();

        for (let i = 0; i < this.clientIds.length; i++) {
            const currentClient = clientData[this.clientIds[i]];
         
            // Add the clients position and rotation to the update
            update.addPlayer(
                currentClient.client.id,
                currentClient.playerPosition,
                currentClient.playerRotation
            );

            // Add the clients object to the update
            currentClient.objects.forEach(obj => {
                update.addObject(obj);
            });
        }
        
        // Add any object to the list of previous objects that were present in the
        // previous update, but not in this one.
        if (this.prevData !== null && this.prevData !== undefined) {
            this.prevData.objects.forEach(prevObj => {
                let present = false;
                for (let i = 0; i < update.objects.length; i++) {
                    if (prevObj.id === update.objects[i].id) {
                        present = true;
                        break;
                    }
                }

                if (!present) {
                    update.addPrevious(prevObj);
                }
            });
        }

        this.prevData = update;
        return update;
    }

    update(clientCount) {
        const clientData = this._getRecentData(clientCount);
        const update = this._buildData(clientData);

        this.softReset();
        return update;
    }
    
    softReset() {
        this.clientIds = [];        
    }

    reset() {
        this.clientIds = [];   
        this.prevData = null;
        this.inputBuffer = [];     
    }
};
