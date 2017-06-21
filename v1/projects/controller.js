 const _ = require('lodash');
const ErrorHandler = require('../../lib/error.handler');
const SuccessHandler = require('../../lib/success.handler');
const Project = require('./model')

exports.findAll = function (req, res) {
    Project
        .find()
        .sort({ date: 1})
        .lean()
        .then(function(projects){
            return projects;
        })
        .then(function(projects) {
            SuccessHandler.handle(res, 200, projects);
        }, function(error) {
            ErrorHandler.handle(res, error, 404);
        });
}

exports.findById = function(req, res) {
    Project.findOne({
            _id: req.query._id
        })
        .then(function(project) {
            if (!project) {
                return ErrorHandler.handle(res, new Error('Not found'), 404);
            }
            SuccessHandler.handle(res, 200, project);
        }, function(error) {
            ErrorHandler.handle(res, error, 404);
        });
}

exports.create = function(req, res) {
    Project
        .create(req.body)
        .then(function(project) {
            SuccessHandler.handle(res, 201, project._id);
        }, function(error) {
            ErrorHandler.handle(res, error, 422);
        });
}

exports.destroy = function(req, res) {
    Project.remove({
            _id: req.query._id
        })
        .then(function(project) {
            if (!project) {
                return ErrorHandler.handle(res, new Error('Not found'), 404);
            }
            SuccessHandler.handle(res, 204);
        }, function(error) {
            ErrorHandler.handle(res, error, 422);
        });
}
