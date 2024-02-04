//////////
//VARIABLE AND REQUIRE
const express = require('express');
const router = express.Router();

const AuthController = require('../controller/auth.controller');

//////////
//////////

//////////
//API ROUTES

//ROUTE REGISTER
router.post('/auth/register', AuthController.create);

//Export router and users
module.exports = router;