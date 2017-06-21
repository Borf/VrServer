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
        verifyToken: {
            type: String,
        },
        token_secret: {
            type: String,
            required: false
        }

    });