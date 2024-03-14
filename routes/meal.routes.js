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
router.post('/meal', checkConnection(['user']), upload, MealController.create);
//Route get last meal
router.get('/meal', checkConnection(['user', 'health']), MealController.getLast);
//Route delete one meal
router.delete('/meal/:id', checkConnection(['user']), MealController.delete);

//////////
//////////

//////////
//Export router
module.exports = router;
//////////
//////////