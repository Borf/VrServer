const uuid = require('uuid');
const { Socket } = require('net');
const Sender = require('./sender');

class Session extends Sender {
    /**
     * Create's a new session
     * @param {Socket} socket The client socket
     * @param {*} clientInfo The client info
     */
    constructor(socket, clientInfo) {
        super(socket);

        /**
         * An object with the client info of a user
         * @type {*}
         * @readonly
         * @private
         */
        this._clientInfo = clientInfo;

        /**
         * A map with all the tunnels
         * @type {Map.<string, Tunnel>}
         * @readonly
         */
        this._tunnels = new Map();

        /**
         * A key required to tunnel to this session
         * @type {string}
         * @private
         */
        this._tunnelKey = '';

        /**
         * The UUID of this session
         * @type {string}
         * @readonly
         * @private
         */
        this._id = uuid.v4();

        /**
         * The starting time of this session
         * @type {number}
         * @readonly
         * @private
         */
        this._startTime = Date.now();

        /**
         * The ending time of this session
         * @type {number}
         */
        this._endTime = 0;

        /**
         * The last time this session sent a ping
         * @type {number}
         * @private
         */
        this._lastPing = Date.now();

        /**
         * An array of fps statistics
         * @type {Array}
         * @private
         */
        this._fps = [];

        /**
         * An array of supported features
         * @type {Array}
         * @private
         */
        this._features = [];

        Object.defineProperty(this, 'id', {
            enumerable: true,
            value: this._id
        });

        Object.defineProperty(this, 'features', {
            enumerable: true,
            get: () => this._features
        });

        Object.defineProperty(this, 'lastPing', {
            enumerable: true,
            get: () => this._lastPing
        })
    }

    /**
     * _ping_ method to update fps and lastping time
     * @param {object} data The report data from NetworkEngine
     */
    report(data) {
        this._fps.push({
            time: Date.now() - this._startTime,
            fps: data.fps
        });
        this._lastPing = Date.now();
    }

    /**
     * Returns whether this session supports the specified feature
     * @param {string} feature The feature to check
     */
    hasFeature(feature) {
        return ~this._features.indexOf(feature);
    }

    /**
     * Checks whether the given key is correct
     * @param {string} key The key to validate
     */
    isValidKey(key) {
        if(this._tunnelKey === '') return true;

        return key && key === this._tunnelKey;
    }

    /**
     * Adds a new tunnel to this session
     * @param {Tunnel} tunnel The tunnel to add
     */
    addTunnel(tunnel) {
        this._tunnels.set(tunnel.id, tunnel);

        // Tell the connected client he has a new tunnel
        this.send('tunnel/connect', { id: tunnel.id });
    }

    /**
     * Checks wheter this session contains the specified tunnel
     * @param {string} id The tunnel id
     */
    hasTunnel(id) {
        return this._tunnels.has(id);
    }

    /**
     * Returns the specified tunnel
     * @param {string} id The tunnel id
     */
    getTunnel(id) {
        return this._tunnels.get(id);
    }

    /**
     * Adds the specified features to the session
     * @param {Array} features Features to add
     */
    addFeatures(features) {
        const newFeatures = [...this._features, ...features];
        this._features = [ ...new Set(newFeatures) ];
    }

    /**
     * Sets the specified key as tunnel key
     * @param {string} key The tunnel key
     */
    setTunnelKey(key) {
        this._tunnelKey = key;
    }

    destroy() {
        // Notify all tunnels we are closing...
        for(const tunnel of this._tunnels.values()) {
            tunnel.creator.send('tunnel/close', { id: tunnel.id });
        }

        if(this._socket && !this._socket.destroyed)
            this._socket.destroy();
    }

    /**
     * Returns the session in json.
     */
    toJSON() {
        return {
            id: this._id,
            startTime: this._startTime / 1000 | 0,
            endTime: this._endTime / 1000 | 0,
            lastping: this._lastPing / 1000 | 0,
            fps: this._fps,
            features: this._features,
            clientinfo: this._clientInfo
        }
    }
}

class Tunnel {
    /**
     * Constructs a new Tunnel instance
     * @param {net.Socket} creator The creator of this tunnel
     */
    constructor(creator) {
        /**
         * The UUID of this session
         * @type {string}
         * @readonly
         */
        this.id = uuid.v4();

        /**
         * The creator session of this tunnel
         * @type {Sender}
         * @readonly
         */
        this.creator = new Sender(creator);
    }
}

module.exports.Session = Session;
module.exports.Tunnel = Tunnel;