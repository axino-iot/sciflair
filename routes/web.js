const express = require('express');
const router = express.Router();
const moment = require('moment');

//welcome page
router.get('/', (req,res) => res.render('home', { layout: 'layout' }));

module.exports = router;