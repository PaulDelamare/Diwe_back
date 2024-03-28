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

//Post carbdata
router.post('/medicalData', MedicalDataController.postUserMedicalData);
//Get carbdata
router.get('/medicalData', checkConnection(['user', 'health']), MedicalDataController.getUserMedicalInformation);

//////////
//////////

//////////
//Export router and users
module.exports = router;
//////////
//////////