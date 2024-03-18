//////////
//VARIABLE AND REQUIRE
const express = require('express');
const router = express.Router();
// Import controller
const AuthController = require('../controller/auth.controller');

//////////
//////////

//////////
//API ROUTES

//Route register
router.post('/auth/register', AuthController.create);
//Resend email
router.post('/auth/resend', AuthController.resendEmail);
//Router login
router.post('/auth/login', AuthController.login);
//Router login
router.post('/auth/two-factor', AuthController.verifyCode);
//Resend login code
router.post('/auth/resend-code', AuthController.resendCode);

//////////
//////////

//////////
//Export router and users
module.exports = router;
//////////
//////////