//////////
//VARIABLE AND REQUIRE
const express = require('express');
const router = express.Router();

const PopupController = require('../controller/popup.controller');

const multer  = require('multer');
const upload = multer().single('image');

//////////
//////////

//////////
//API ROUTES

//Route create new popup
router.get('/new-daily-popup', upload , PopupController.create);

//////////
//////////

//////////
//Export router and users
module.exports = router;
//////////
//////////