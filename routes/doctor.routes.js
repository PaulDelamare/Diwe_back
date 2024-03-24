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
router.post('/doctor/validate-request', checkConnection(['health']), DocotorController.validateRequestLink);
//Get all users linked to doctor
router.get('/doctor/users', checkConnection(['health']), DocotorController.getUsersLink);
//Get user information
router.get('/doctor/user-detail', checkConnection(['health']), DocotorController.getSingleUser);

//////////
//////////

//////////
//Export router
module.exports = router;
//////////
//////////