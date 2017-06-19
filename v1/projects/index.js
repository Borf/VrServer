'use strict';

const controller = require('./controller');
const express = require('express');

var router = express.Router();

router.get('/', controller.findAll);
router.get('/id', controller.findById);
router.post('/add', controller.add);
router.post('/update/add', controller.addUpdate);
router.delete('/remove', controller.remove);

module.exports = router;