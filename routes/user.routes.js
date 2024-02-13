//////////
//VARIABLE AND REQUIRE
const express = require('express');
const router = express.Router();
//Import controller
const UserController = require('../controller/user.controller');
//Import connection verification
const checkConnection = require ('../utils/validateRole');

//////////
//////////

//////////
//API ROUTES

//Route register
router.get('/user/last-connection', checkConnection(), UserController.checkLastConnection);

//////////
//////////

//////////
//Export router
module.exports = router;
//////////
//////////