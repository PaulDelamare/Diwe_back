//////////
//VARIABLE AND REQUIRE
const express = require('express');
const router = express.Router();

const AuthController = require('../controller/auth.controller');
const UserController = require('../controller/user.controller');

//////////
//////////

//////////
//API ROUTES

//Route validate Account
router.get('/validateAccount/:email/:token', AuthController.validateAccount);
//Route validate new email
router.get('/verify-email-change', UserController.verifyEmailRequest);

//////////
//////////

//////////
//Export router and users
module.exports = router;
//////////
//////////