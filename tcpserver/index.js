const Server = require('./server');
const { Session, Tunnel } = require('./session');

const server = new Server();

module.exports.start = (sessions) => {

    //#region Session binding

    server.bind('session/start', (req, res) => {
        const session = new Session(req.socket, req.packet.data);

        req.socket.session = session;
        sessions.set(session.id, session);

        console.debug(`[DEBUG]: Created new session ${session.id} for ${req.socket.name}`);

        res.send('session/start', 'ok');
    });

    server.bind('session/enable', (req, res) => {
        req.socket.session.addFeatures(req.packet.data);
        console.debug(`[DEBUG]: Added features [ ${req.packet.data} ] to session ${req.socket.session.id}`);

        if(req.packet.key) {
            req.socket.session.setTunnelKey(req.packet.key);
            console.debug(`[DEBUG]: Added tunnel key to session ${req.socket.session.id}`);
        }
    });

    server.bind('session/report', (req, res) => {
        req.socket.session.report(req.packet.data);
    });

    server.bind('session/list', (req, res) => {
        res.send('session/list', Array.from(sessions.values()).map(session => session.toJSON()));
    });

    //#endregion

    //#region Tunnel bindings

    server.bind('tunnel/create', (req, res) => {
        const session = sessions.get(req.packet.data.session);

        if(session && session.hasFeature('tunnel') && session.isValidKey(req.packet.data.key)) {
            const tunnel = new Tunnel(req.socket);
            session.addTunnel(tunnel);
            console.debug(`[DEBUG]: Added tunnel ${tunnel.id} to session ${session.id}`);

            res.send('tunnel/create', { status: 'ok', id: tunnel.id });
            return;
        }

        res.send('tunnel/create', { status: 'error' })
    });

    server.bind('tunnel/send', (req, res) => {
        const session = new Array(...sessions.values()).find(s => s.hasTunnel(req.packet.data.dest));

        if(session) {
            const tunnel = session.getTunnel(req.packet.data.dest);

            const data = {
                id: tunnel.id, data: req.packet.data.data
            };

            if(req.socket.session === session) {
                tunnel.creator.send('tunnel/send', data);
            } else {
                session.send('tunnel/send', data);
            }

            return;
        }
        console.log(`[DEBUG]: Failed to find session ${req.packet.data.dest}`);
    });

    //#endregion

    server.on('close', socket => {
        if(socket.session) {
            sessions.delete(socket.session.id);

            console.info(`[INFO]: Cleaning up tunnels for ${socket.name}`);
            socket.session.destroy();

            // TODO: Also check other sessions and remove tunnels to me.
        }
    });

    // Check sessions every minute and clean it up
    setInterval(() => {
        console.info(`[INFO]: Cleaning up sessions`);
        const timestamp = Date.now();

        for(const sessionEntry of sessions.entries()) {
            if(timestamp - sessionEntry[1].lastPing > 1000 * 60) {
                console.debug(`[DEBUG]: Session ${sessionEntry[0]} did not report anything for more then a minute, cleaning up...`);
                sessionEntry[1].destroy();
                sessions.delete(sessionEntry[0]);
            }
        }
    }, 1000 * 60);

    server.start(6666);
}