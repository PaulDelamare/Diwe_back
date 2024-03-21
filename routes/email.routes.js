//////////
//VARIABLE AND REQUIRE
const express = require('express');
const router = express.Router();
// Import controller
const EmailController = require('../controller/email.controller');
//For receive information from form data
const multer  = require('multer');
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });
//Import connection verification
const checkConnection = require ('../utils/validateRole');

//////////
//////////

//////////
//API ROUTES

//Route register
router.post('/sendEmail', checkConnection(),  upload.array('files'), EmailController.sendEmail);

//////////
//////////

//////////
//Export router and users
module.exports = router;
//////////
//////////