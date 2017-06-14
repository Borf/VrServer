'use strict';

const controller = require('./controller');
const express = require('express');

var router = express.Router();

router.get('/', controller.findAll);
router.get('/studentnr', controller.findBySessionId);
router.post('/add', controller.add);
router.delete('/remove', controller.remove);

module.exports = router;