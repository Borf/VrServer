const _ = require('lodash');
const ErrorHandler = require('../../lib/error.handler');
const SuccessHandler = require('../../lib/success.handler');
const Student = require('./model')

exports.findAll = function (req, res) {
    Student
        .find()
        .sort({ name: 1})
        .lean()
        .then(function(students){
            return students;
        })
        .then(function(students) {
            SuccessHandler.handle(res, 200, students);
        }, function(error) {
            ErrorHandler.handle(res, error, 404);
        });
}

exports.findByStudentNr = function(req, res) {
    Student.findOne({
            student_nr: req.query.student_nr
        })
        .then(function(student) {
            if (!student) {
                return ErrorHandler.handle(res, new Error('Not found'), 404);
            }
            SuccessHandler.handle(res, 200, student);
        }, function(error) {
            ErrorHandler.handle(res, error, 404);
        });
}

exports.create = function(req, res) {
    Student
        .create(req.body)
        .then(function(student) {
            SuccessHandler.handle(res, 201, student);
        }, function(error) {
            ErrorHandler.handle(res, error, 422);
        });
}

exports.destroy = function(req, res) {
    Student.remove({
            student_nr: req.query.student_nr
        })
        .then(function(student) {
            if (!student) {
                return ErrorHandler.handle(res, new Error('Not found'), 404);
            }
            SuccessHandler.handle(res, 204);
        }, function(error) {
            ErrorHandler.handle(res, error, 422);
        });
}
