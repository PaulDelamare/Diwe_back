//////////
//VARIABLE AND REQUIRE
const express = require('express');
const router = express.Router();
//For receive information from form data
const multer  = require('multer');
const upload = multer().single('image');
//Import controller
const PopupController = require('../controller/popup.controller');
//Importfunction for check role
const checkRole = require ('../utils/validateRole');

//////////
//////////

//////////
//API ROUTES

//Route create new popup
router.post('/new-daily-popup', checkRole.checkAuthAndRole('blog'), upload, PopupController.create);

//////////
//////////

//////////
//Export router
module.exports = router;
//////////
//////////