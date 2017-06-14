'use strict';

var mongoose = require('mongoose');

module.exports = mongoose.model('Project', require('./schema'));
