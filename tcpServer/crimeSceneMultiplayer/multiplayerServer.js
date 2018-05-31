// Use a logger module to allow for logging to be disabled.
const Logger = require("./logger")();
const Response = require("../Response");
const Update = require("./Update");
const Client = require("./Client");
const ServerUpdate = require("./ServerUpdate");

// Possible states the server can be in.
const STATES = {
    // No dictionary or master.
    IDLE: 0,
    // No dictionary, but master client is assigned.
    AWATING_DATA: 1,
    // Dictionary and master client are assigned.
    READY: 2
};

// Possible message ids
const MESSAGES = {
    UPDATE: "crimeScene/update",
    CLIENT: "crimeScene/client",
    DICT: "crimeScene/dict"
};

// Store the id => uuid dictionary initialiy empty.
let idDict = {};
// Store every client connected to the crimeScene.
let clients = [];
let clientId = 0;
// Store the current state of the server.
let state = STATES.IDLE;
let run = false;

let previousInput = null;
const inputBuffer = [];

// Check if a master client is already present.
function getMaster() {
    for (let i = 0; i < clients.length; i++) {
        if (clients[i].master) {
            return clients[i];
        }
    }
    return null;
}

function findObject(list, id) {
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) {
            return list[i];
        }
    }
}

function buildData(dict, clientIds, prevData) {
    if (clientIds.length === 0) {
        return null;
    }

    let data = new ServerUpdate();
    
    // Get a basic list of objects to loop through
    let baseData = dict[clientIds[0]].objects;
    for (let i = 0; i < baseData.length; i++) {
        let currentObject = baseData[i];
    
        // If there is no previous input, just use the base object
        if (prevData === null) {
            data.addObject(currentObject);
        // If there was previous data compare the new data to the previous
        } else {
            let prevObj = findObject(prevData.objects, currentObject.id);
            let diffObj = null;

            for (let ii = 0; ii < clientIds.length; ii++) {
                let localObj = findObject(dict[clientIds[ii]].objects, currentObject.id);

                // If there is a difference just set it and stop the loop
                if (!prevObj.compare(localObj)) {
                    diffObj = localObj;
                    break;
                }
            }
            if (diffObj === null) {
                data.addObject(currentObject);
            } else {
                data.addObject(diffObj);
            }
        }
    }

    // Player position and rotation
    clientIds.forEach((localId) => {
        let clientUpdate = dict[localId];
        data.addPlayer(clientUpdate.playerPosition, clientUpdate.playerRotation);
    });
    
    return data;
}

function update() {
    // Get the lastest data, while clearing the buffer
    let clientInput = inputBuffer.splice(0, inputBuffer.length);
    let clientIds = [];
    let clientData = {};

    // Create a dictionary of the most recent 
    for (let i = clientInput.length - 1; i >= 0; i--) {
        let currentClient = clientInput[i].client;
        let currentId = currentClient.id.toString();

        if (clientData[currentId] === undefined) {
            clientIds.push(currentId);
            clientData[currentId] = clientInput[i];
            if (clientIds.length >= clients.length) {
                break;
            }
        }
    }

    let data = buildData(clientData, clientIds, previousInput);
    if (data !== null && data !== undefined) {
        previousInput = data;
        console.log(data);
        // TODO: send data to clients.
    }

    if (run) {
        setTimeout(() => {
            update();
        }, 67);
    }
}

function findClient(socket) {
    for (let i = 0; i < clients.length; i++) {
        if (clients[i].socket === socket) {
            return clients[i];
        }
    }
}

// Expose the function which will bind the functionality to the jsonServer.
exports.start = function(sessions, jsonServer) {
    // updated object data received, forward to all other clients
    jsonServer.bind(MESSAGES.UPDATE, (req, res) => {
        let client = findClient(req.socket);
        if (client === undefined) {
            Logger.log("CRITICAL: Couldn't find client!");
            return;
        }
        inputBuffer.push(new Update(client, req.data));

        clients.forEach(client => {
            if (client.socket === req.socket) return;

            let response = new Response(client.socket);
            response.send(MESSAGES.UPDATE, req.data);
        });
    });

    // A new client wants to connect to the crimeScene
    jsonServer.bind(MESSAGES.CLIENT, (req, res) => {
        let master = getMaster() ? false : true;
        
        run = true;
        if (clients.length === 0) {
            update();
        }
        
        let client = new Client(req.socket, clientId++ ,master);
        clients.push(client);

        switch (state) {
        case STATES.IDLE:
            state = STATES.AWATING_DATA;
            res.send(MESSAGES.CLIENT, {
                clientId: client.id,
                status: "noData"
            });
            break;
        case STATES.AWATING_DATA:
            res.send(MESSAGES.CLIENT, {
                clientId: client.id,
                status: "awaitingData"
            });
            break;
        case STATES.READY:
            res.send(MESSAGES.CLIENT, {
                clientId: client.id,
                status: "dictReady"
            });
            res.send(MESSAGES.DICT, {
                dict: idDict
            });
            break;
        default:
            Logger.log(`Server is in invalid state: ${state}`);
            break;
        }
    });

    // A client has sent the dictionary
    jsonServer.bind(MESSAGES.DICT, (req, res) => {
        if (req.socket !== getMaster().socket) {
            Logger.log("A client who was not the master sent a dictionary.");
            return;
        }

        // Send the dictionary to any client that doesn't have it yet.
        idDict = req.data.dict;
        state = STATES.READY;
        jsonServer.broadcast(
            {
                id: MESSAGES.DICT,
                data: {
                    dict: idDict
                }
            },
            req.socket
        );
    });

    // When a client disconnects this function is called.
    jsonServer.close(socket => {
        if (socket === getMaster()) {
            Logger.log("The master client has disconnected.");
        }

        // Find and remove the client from the list of clients
        for (let i = 0; i < clients.length; i++) {
            if (clients[i].socket !== socket) continue;
            clients.splice(i, 1);
            break;
        }

        // If there are no more clients, reset the crimeScene values.
        if (clients.length <= 0) {
            run = false;
            Logger.log("No more clients connected, resetting crimeScene...");
            idDict = {};
            clients = [];
            state = STATES.IDLE;
            clientId = 0;
        }
    });
};
