'use strict';

const controller = require('./controller');
const express = require('express');

var router = express.Router();

router.get('/', controller.findAll);
router.get('/id', controller.findById);
router.get('/studentnr', controller.findByStudentNr);
router.post('/add', controller.create);
router.delete('/remove', controller.destroy);

module.exports = router;