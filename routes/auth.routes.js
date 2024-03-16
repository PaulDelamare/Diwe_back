//////////
//VARIABLE AND REQUIRE
const express = require('express');
const router = express.Router();

const AuthController = require('../controller/auth.controller');

//////////
//////////

//////////
//API ROUTES

//Route register
router.post('/auth/register', AuthController.create);
//Router login
router.post('/auth/login', AuthController.login);
//Resend email
router.post('/auth/resend', AuthController.resendEmail);

//////////
//////////

//////////
//Export router and users
module.exports = router;
//////////
//////////