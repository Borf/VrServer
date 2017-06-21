'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var AnswerSchema = new Schema(
{
	session_id: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	answer: {
		type: String,
		required: true
	},
	correct_answer: {
		type: String,
		required:true
	},
	image_url: {
		type: String
	}
});

module.exports = AnswerSchema;