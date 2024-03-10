//////////
//VARIABLE AND REQUIRE
const express = require('express');
//Import router
const router = express.Router();
//Import controller
const DocotorController = require('../controller/doctor.controller');
//Importfunction for check role
const checkConnection = require ('../utils/validateRole');
//////////
//////////

//////////
//API ROUTES

//Route create new popup
router.get('/doctor/request', checkConnection('health'), DocotorController.getRequestLink);

//////////
//////////

//////////
//Export router
module.exports = router;
//////////
//////////