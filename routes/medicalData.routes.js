//////////
//VARIABLE AND REQUIRE
const express = require('express');
const router = express.Router();
// Import order Controller
const MedicalDataController = require('../controller/medicalData.controller');
//Importfunction for check role
const checkConnection = require ('../utils/validateRole');
//////////
//////////

//////////
//API ROUTES

//Get carbdata
router.post('/medicalData', MedicalDataController.postUserMedicalData);

//////////
//////////

//////////
//Export router and users
module.exports = router;
//////////
//////////