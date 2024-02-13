//////////
//REQUIRE
//Import popup model
const Popup = require('../models/Popup');
//Import validateBody class for have an acces to validate rules
const ValidateBody = require('../utils/validateBody');
//Require fs (file system)
const fs = require('fs');
//Require path
const path = require('path');
//////////
//////////

//////////
//FUNCTION CONTROLLER

//Create popup
exports.create = async (req, res) => {

    //Validation
    //Instance validateBody
    const validateBody = new ValidateBody();

    //Validation
    validateBody.imageValidator('image', true);
    validateBody.textValidator('text', true, 10, 255, 'Le texte');

    //Validate rules
    const valideBody = await validateBody.validateRules(req);

    //If one rule is'nt valid, return error
    if (!valideBody.isEmpty()) {
        // If errors are present, return a JSON response with code 422 Unprocessable Entity
        return res.status(422).json({ errors: valideBody.array() });
    }
    try {
        //Stock in variable image 
        const uploadedImage = req.file;
        //get image extension
        const ext = path.extname(uploadedImage.originalname);
        //Rename image for security
        const fileName = `${Date.now()}-${uploadedImage.originalname.toLowerCase().replace(/[^a-z0-9]/g, '')}${ext}`;
        //Create image file path
        const imageFilePath = `uploads/dailyPopup/${fileName}`;
        //Save image in image file path
        fs.writeFileSync(imageFilePath, uploadedImage.buffer);

        //Add in body image path
        req.body.image_path = imageFilePath;

        //Create popup
        await Popup.create(req.body, res);

        //If popup is create return success
        res.status(201).json({ 
            message: "La popup a été correctement enregistre",
            status : 201
         });

    } catch (error) {

        //If an error occurs, send an error message
        res.status(401).json({
            error: error.message || "Une erreur s'est produite lors de la création de la popup.",
            status : 401
        });
    }
}

//////////
//////////