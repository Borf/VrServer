'use strict';

const controller = require('./controller');
const express = require('express');

var router = express.Router();

router.get('/id', controller.findBySessionId);
router.post('/', controller.create);

module.exports = router;