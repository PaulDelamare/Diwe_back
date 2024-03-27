//////////
//VARIABLE AND REQUIRE
const express = require('express');
const router = express.Router();
// Import order Controller
const OrderController = require('../controller/order.controller');
//Importfunction for check role
const checkConnection = require ('../utils/validateRole');
//////////
//////////

//////////
//API ROUTES

//Create order
router.post('/order', checkConnection(['user']), OrderController.create);

//////////
//////////

//////////
//Export router and users
module.exports = router;
//////////
//////////