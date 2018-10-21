const web = require('./app');
const tcp = require('./tcpserver');

(function () {
    /**
     * A map with all the active session
     * @type {Map.<string, Session>}
     */
    const sessions = new Map();

    if (!~process.argv.indexOf('--no-tcp')) {
        tcp.start(sessions);
    }
    if (!~process.argv.indexOf('--no-web')) {
        web.start(sessions);
    }
})();