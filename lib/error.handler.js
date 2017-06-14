'use strict'

const _ = require('lodash');

exports.handle = function(res, error, statusCode) {
    if (error.errors) {
        return res
            .status(statusCode)
            .json({
                'errors': _.map(error.errors, function(error) {
                    if (error.properties) {
                        return error.properties;
                    }
                    return { message: error.message };
                })
            });
    }

    let parameters = error.parameters || [];
    if (error.message) {
        return res.status(statusCode).json({
            errors: [{
                message: error.message,
                parameters: parameters
            }]
        });
    }

    return res.status(statusCode).send(error);
};
