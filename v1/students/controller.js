const _ = require('lodash');
const ErrorHandler = require('../../lib/error.handler');
const SuccessHandler = require('../../lib/success.handler');
const RabbitHandler = require('../../lib/rabbit.handler');
const Student = require('./model')

exports.findAll = function (req, res) {
    Student
        .find()
        .sort('-name')
        .lean()
        .then(function(students){
            return students;
        })
        .then(function(students) {
            SuccessHandler.handle(res, 200, warnings);
        }, function(error) {
            ErrorHandler.handle(res, error, 404);
        });
}

exports.findByStudentNr = function(req, res) {
    res.send('not implemented yet');
}

exports.add = function(req, res) {
    res.send('not implemented yet');
}

exports.remove = function(req, res) {
    res.send('not implemented yet');
}
