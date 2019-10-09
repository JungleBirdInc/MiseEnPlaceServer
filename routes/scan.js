const express = require('express');
const router = express.Router();
const Fuse = require('fuse.js');
require('dotenv').config();

const models = require('../app/models/db.js');


module.exports = router;