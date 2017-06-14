'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const studentSchema = require('../students/schema');

var AnswerSchema = new Schema(
{
	answer: {
		type: String,
		required: true
	},
	correct_answer: {
		type: String,
		required:true
	}
});

var SessionSchema = new Schema(
{
	student: {
		type: mongoose.Schema.ObjectId,
		ref: 'Student',
		required: true
	},
	session_id: {
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
	},
	answers: [
		type: AnswerSchema,
		default: undefined
	]
});

module.exports = SessionSchema;