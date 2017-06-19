'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var ProjectSchema = new Schema(
{
	project_id: {
		type: String,
		required: true,
		unique: true
	},
	title: {
		type: String,
		required: true
	},
	url: {
		type: String
	},
	desc: {
		type: String,
		required: true
	},
	icon: {
		type: String
	}
});

module.exports = ProjectSchema;