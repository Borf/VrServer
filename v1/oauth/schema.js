'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        user_id: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        },
        token_secret: {
            type: String,
            required: false
        },
        username: {
            type: String,
        },
        studentnr: {
            type: Number,
        }

    });

module.exports = UserSchema;