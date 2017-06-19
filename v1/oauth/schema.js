'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        user_id: {
            type: String,
            required: true
        },
        student_nr: {
            type: String,
            unique: true,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        },
        verifyToken: {
            type: String,
            required: true
        }

    });