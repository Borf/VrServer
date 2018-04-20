const webServer = require('./webServer');

const tcpServer = require('./tcpServer/tcpServer');

const NO_TCP = '-no--tcp';
const NO_WEB = '-no--web';
// Additionaly the command '-no--log' is available to disable crimeScene logging.

(function() {
    let sessions = [];

    if (process.argv.indexOf(NO_TCP) === -1) {
        tcpServer.start(sessions);
    }
    if (process.argv.indexOf(NO_WEB) === -1) {
        webServer.start(sessions);
    }    
})();
