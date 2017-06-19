'use strict';

const controller = require('./controller');
const express = require('express');

var router = express.Router();

router.get('/', controller.index);
router.get('/callback', controller.callback);
router.get('/validateLogin', controller.validateLogin);

module.exports = router;