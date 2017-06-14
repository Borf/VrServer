'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var StudentSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	student_nr: {
		type: String,
		required: true
	},
	profile_image: {
		type: String
	}
});

module.exports = StudentSchema;