'use strict';

const controller = require('./controller');
const express = require('express');

var router = express.Router();

router.get('/id', controller.findByProjectId);
router.post('/add', controller.create);

module.exports = router;