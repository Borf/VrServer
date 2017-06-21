'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var SessionSchema = new Schema(
{
	student_name: {
		type: String,
		required: true
	},
	student_id: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	},
	type: {
		type: String,
		required: true
	},
	time: {
		type: String,
		required: true
	},
	session_data: [{
		key: String,
		value: String
	}],
	pdf_name: {
		type: String
	},
	pdf_url: {
		type: String
	}
});

module.exports = SessionSchema;