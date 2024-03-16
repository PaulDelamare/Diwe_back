//////////
//VARIABLE AND REQUIRE
const express = require('express');
const router = express.Router();

const AuthController = require('../controller/auth.controller');

//////////
//////////

//////////
//API ROUTES

//Route validate Account
router.get('/validateAccount/:email/:token', AuthController.validateAccount);

//////////
//////////

//////////
//Export router and users
module.exports = router;
//////////
//////////