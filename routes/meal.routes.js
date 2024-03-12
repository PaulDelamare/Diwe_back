//////////
//VARIABLE AND REQUIRE
const express = require('express');
//Import router
const router = express.Router();
//For receive information from form data
const multer  = require('multer');
const upload = multer().single('image');
//Import controller
const MealController = require('../controller/meal.controller');
//Importfunction for check role
const checkConnection = require ('../utils/validateRole');
//////////
//////////

//////////
//API ROUTES

//Route add meal
router.post('/meal', checkConnection('user'), upload, MealController.create);


//////////
//////////

//////////
//Export router
module.exports = router;
//////////
//////////