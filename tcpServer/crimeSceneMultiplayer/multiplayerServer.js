// Use a logger module to allow for logging to be disabled.
const Logger = require("./logger")();
const Response = require("../Response");
const Client = require("./Client");
const JsonUpdate = require("./JsonUpdate");
const UpdateTracker = require("./UpdateTracker");

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

// Keep track of client update data.
const clientsReceived = [];
const updateTracker = new UpdateTracker();

// Check if a master client is already present.
function getMaster() {
    for (let i = 0; i < clients.length; i++) {
        if (clients[i].master) {
            return clients[i];
        }
    }
    return null;
}

// Get the client object for the corresponding socket
function findClient(socket) {
    for (let i = 0; i < clients.length; i++) {
        if (clients[i].socket === socket) {
            return clients[i];
        }
    }
}

// Called when an update message is received.
function messageUpdate(req) {
    let client = findClient(req.socket);
    if (client === undefined) {
        Logger.log("CRITICAL: Couldn't find client!");
        return;
    }
    let clientData = new JsonUpdate(client, req.data);
    // let clientData = new Update(client, req.data);
    if (!clientsReceived.includes(client.id)) {
        clientsReceived.push(client.id);
    }
    updateTracker.addData(clientData);

    // Only continue if every client has sent a message
    if (clientsReceived.length >= clients.length) {
        clientsReceived.splice(0, clientsReceived.length);
        const updateData = updateTracker.update();
        clients.forEach(client => {
            let response = new Response(client.socket);
            response.send(MESSAGES.UPDATE, updateData.toJson());
        });
    }
}

// Called when a new client connects
function messageClient(req, res) {
    let master = getMaster() ? false : true;

    let client = new Client(req.socket, clientId++, master);
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
}

// Called when the server receives a dictionary
function messageDictionary(req, jsonServer) {
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
}

// Called when a client disconnects
function clientDisconnect(socket) {
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
        Logger.log("No more clients connected, resetting crimeScene...");
        idDict = {};
        clients = [];
        state = STATES.IDLE;
        clientId = 0;
    }
}

// Expose the function which will bind the functionality to the jsonServer.
exports.start = function(sessions, jsonServer) {
    // updated object data received, forward to all other clients
    jsonServer.bind(MESSAGES.UPDATE, (req) => {
        messageUpdate(req);
    });

    // A new client wants to connect to the crimeScene
    jsonServer.bind(MESSAGES.CLIENT, (req, res) => {
        messageClient(req, res);
    });

    // A client has sent the dictionary
    jsonServer.bind(MESSAGES.DICT, (req) => {
        messageDictionary(req, jsonServer);
    });

    // When a client disconnects this function is called.
    jsonServer.close(socket => {
        clientDisconnect(socket);
    });
};
