//////////
//VARIABLE AND REQUIRE
const express = require('express');
const router = express.Router();

const EmailController = require('../controller/email.controller');

//////////
//////////

//////////
//API ROUTES

//Route register
router.post('/sendEmail', EmailController.sendEmail);

//////////
//////////

//////////
//Export router and users
module.exports = router;
//////////
//////////