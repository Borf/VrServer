'use strict';

const _ = require('lodash');

exports.handle = function(res, statusCode, response) {
    if (response) {
        return res.status(statusCode).json(response);
    }

    return res.status(statusCode).send({
        'message': 'success'
    });
};
