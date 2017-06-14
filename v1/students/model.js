'use strict';

var mongoose = require('mongoose');

module.exports = mongoose.model('Student', require('./schema'));
