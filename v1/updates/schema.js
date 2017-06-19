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
		type: String
	}
});

module.exports = UpdateSchema;
