'use strict';

const controller = require('./controller');
const express = require('express');

var router = express.Router();

router.get('/', controller.index);
router.get('/callback', controller.callback);
router.get('/validateLogin', controller.validateLogin);
router.get('/finishlogin', controller.finishLogin);
router.post('/confirm', controller.confirm);

module.exports = router;