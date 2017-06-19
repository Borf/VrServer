const _ = require('lodash');
const ErrorHandler = require('../../lib/error.handler');
const SuccessHandler = require('../../lib/success.handler');
const Session = require('./model')

exports.findAll = function (req, res) {
    Session
        .find()
        .sort({ date: 1})
        .lean()
        .then(function(sessions){
            return sessions;
        })
        .then(function(sessions) {
            SuccessHandler.handle(res, 200, sessions);
        }, function(error) {
            ErrorHandler.handle(res, error, 404);
        });
}

exports.findById = function(req, res) {
    Session.findOne({
            _id: req.query._id
        })
        .then(function(session) {
            if (!session) {
                return ErrorHandler.handle(res, new Error('Not found'), 404);
            }
            SuccessHandler.handle(res, 200, session);
        }, function(error) {
            ErrorHandler.handle(res, error, 404);
        });
}
/*TODO: find how to search for nested object ids*/
exports.findByStudentNr = function(req, res) {
    Session.find({
            student_nr : req.query.student_nr
        })
        .then(function(sessions) {
            if (!sessions) {
                return ErrorHandler.handle(res, new Error('Not found'), 404);
            }
            SuccessHandler.handle(res, 200, sessions);
        }, function(error) {
            ErrorHandler.handle(res, error, 404);
        });
}

/*TO-DO: expand by using server date */

exports.create = function(req, res) {
    Session
        .create(req.body)
        .then(function(session) {
            SuccessHandler.handle(res, 201, session._id);
        }, function(error) {
            ErrorHandler.handle(res, error, 422);
        });
}

exports.destroy = function(req, res) {
    Session.remove({
            _id: req.query._id
        })
        .then(function(session) {
            if (!session) {
                return ErrorHandler.handle(res, new Error('Not found'), 404);
            }
            SuccessHandler.handle(res, 204);
        }, function(error) {
            ErrorHandler.handle(res, error, 422);
        });
}
