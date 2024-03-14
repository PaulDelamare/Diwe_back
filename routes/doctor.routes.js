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

//Routes
//Route for request link
router.get('/doctor/request', checkConnection(['health']), DocotorController.getRequestLink);
// Validate request
router.post('/doctor/validate-request/:id', checkConnection(['health']), DocotorController.validateRequestLink);
//Get all users linked to doctor
router.get('/doctor/users', checkConnection(['health']), DocotorController.getUsersLink);

//////////
//////////

//////////
//Export router
module.exports = router;
//////////
//////////