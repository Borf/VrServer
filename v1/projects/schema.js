'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var UpdateSchema = new Schema(
{
	date: {
		type: Date,
		default: Date.now
	},
	title: {
		type: String,
		required:true
	},
	desc: {
		type: String,
		required:true
	},
	image_url: {
		type: String,
		required:false
	}
});

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
	},
	updates: [
		type: UpdateSchema,
		default: undefined
	]
});

module.exports = ProjectSchema;