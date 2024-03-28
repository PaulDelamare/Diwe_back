//////////
//VARIABLE AND REQUIRE
const express = require('express');
const router = express.Router();

const trackingController = require('../controller/trackingEmail.controller');

//////////
//////////

//////////
//API ROUTES

//Tracking pixel
router.get('/read.gif:id_email', trackingController.readEmail);

//////////
//////////

//////////
//Export router and users
module.exports = router;
//////////
//////////