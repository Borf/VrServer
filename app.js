const webServer = require('./webServer');
const tcpServer = require('./tcpServer');

const START_TCP = '-tcp';
const START_WEB = '-web';

(function() {
    let sessions = [];

    if (process.argv.indexOf(START_TCP) !== -1) {
        tcpServer.start(sessions);
    }
    if (process.argv.indexOf(START_WEB) !== -1) {
        webServer.start(sessions);
    }    
})();
