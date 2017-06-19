const _ = require('lodash');
const ErrorHandler = require('../../lib/error.handler');
const SuccessHandler = require('../../lib/success.handler');
const Update = require('./model')

exports.findByProjectId = function(req, res) {
    Update.find({
            project_id: req.query.project_id
        })
        .then(function(update) {
            SuccessHandler.handle(res, 200, update);
        }, function(error) {
            ErrorHandler.handle(res, error, 404);
        });
}

exports.create = function(req, res) {
    Update
        .create(req.body)
        .then(function(update) {
            SuccessHandler.handle(res, 201, update);
        }, function(error) {
            ErrorHandler.handle(res, error, 422);
        });
}