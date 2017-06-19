const _ = require('lodash');
const ErrorHandler = require('../../lib/error.handler');
const SuccessHandler = require('../../lib/success.handler');
const Answer = require('./model')

exports.findBySessionId = function(req, res) {
    Answer.find({
            session_id: req.query.session_id
        })
        .then(function(answers) {
            SuccessHandler.handle(res, 200, answers);
        }, function(error) {
            ErrorHandler.handle(res, error, 404);
        });
}

exports.create = function(req, res) {
    Answer
        .insertMany(req.body)
        .then(function(answers) {
            SuccessHandler.handle(res, 201, answers);
        }, function(error) {
            ErrorHandler.handle(res, error, 422);
        });
}