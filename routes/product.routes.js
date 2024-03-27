//////////
//VARIABLE AND REQUIRE
const express = require('express');
//Import router
const router = express.Router();
//Import controller
const ProductController = require('../controller/product.controller');
//Importfunction for check role
const checkConnection = require ('../utils/validateRole');
//For receive information from form data
const multer  = require('multer');
const upload = multer().single('image');
//////////
//////////

//////////
//API ROUTES

//Routes
//TODO ADD REAL ROLE FOR THIS (NOT NOW FOR SHOW THIS)
//Route for create product
router.post('/product', checkConnection(), upload, ProductController.create);
//Route for get all products
router.get('/product', checkConnection(), upload, ProductController.getAllProducts);
//////////
//////////

//////////
//Export router
module.exports = router;
//////////
//////////