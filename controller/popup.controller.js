//////////
//REQUIRE
//Import popup model
const Popup = require('../models/Popup');
const uploadImage = require('../utils/uploadImage');
//Import validateBody class for have an acces to validate rules
const ValidateBody = require('../utils/validateBody');
//////////
//////////

//////////
//FUNCTION CONTROLLER

//CREATE POPUP
/**
+ *
+ * @param {Object} req - the request object
+ * @param {Object} res - the response object
+ * @return {Object} JSON response with success or error message
+ */
exports.create = async (req, res) => {

    //Validation
    //Instance validateBody
    const validateBody = new ValidateBody();

    //Validation
    validateBody.imageValidator('image', true);
    validateBody.textValidator('text', true, 10, 255, 'Le texte', true);

    //Validate rules
    const valideBody = await validateBody.validateRules(req);

    //If one rule is'nt valid, return error
    if (!valideBody.isEmpty()) {
        // If errors are present, return a JSON response with code 422 Unprocessable Entity
        return res.status(422).json({ errors: valideBody.array(), status : 422 });
    }
    try {

        //Upload image
        req.body.image_path = uploadImage(req.file)('uploads/public/dailyPopup/');

        //Create popup
        await Popup.create(req.body);

        //If popup is create return success
        res.status(201).json({ 
            message: "La popup a été correctement enregistré",
            status : 201
         });

    } catch (error) {

        //If an error occurs, send an error message
        res.status(500).json({
            error: error.message || "Une erreur s'est produite lors de la création de la popup.",
            status : 500
        });
    }
}

//////////
//////////