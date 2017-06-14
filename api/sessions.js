module.exports = function (app) {

    app.get('/v1/sessions', function (req, res) {
        res.send('not implemented yet');
    });

    app.get('/v1/sessions/add', function (req, res) {
        res.send('not implemented yet');
    });

    app.delete('/v1/sessions/remove', function (req, res) {
        res.send('deleted');
    });

    app.get('/v1/sessions/id', function (req, res) {
        res.send('not implemented yet');
    });

    app.get('/v1/sessions/student', function (req, res) {
        res.send('not implemented yet');
    });

}
