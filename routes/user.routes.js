//////////
//VARIABLE AND REQUIRE
const express = require('express');
const router = express.Router();
//For receive information from form data
const multer  = require('multer');
const upload = multer().single('image');
//Import controller
const UserController = require('../controller/user.controller');
//Import connection verification
const checkConnection = require ('../utils/validateRole');

//////////
//////////

//////////
//API ROUTES

//Route last connection
router.get('/user/last-connection', checkConnection(), UserController.checkLastConnection);
//Route update profile picture
router.post('/user/update-profile-picture', checkConnection(), upload, UserController.updateProfilePicture);
//Route update profile picture
router.put('/user/update-information', checkConnection(), UserController.changeInformation);
//Change password
router.put('/user/update-password', checkConnection(), UserController.changePassword);
//Change email
router.put('/user/update-email', checkConnection(), UserController.changeEmail);
//Request deletion
router.put('/user/request-deletion', checkConnection(), UserController.requestDeletion);
//Request link
router.post('/user/request-link', checkConnection('user'), UserController.requestLink);

//////////
//////////

//////////
//Export router
module.exports = router;
//////////
//////////