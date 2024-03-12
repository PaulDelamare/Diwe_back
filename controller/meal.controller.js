//////////
//REQUIRE
//Import meal model
const Meal = require('../models/Meal');
//Import user model
const User = require('../models/User');
const uploadImage = require('../utils/uploadImage');
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


/**
+ * Create meal
+ *
+ * @param {Object} req - the request object
+ * @param {Object} res - the response object
+ * @return {Object} JSON response with success or error message
+ */
exports.create = async (req, res) => {
     
    //Validation
    const user = await User.findById(req.user._id);
    // If the user does not exist, return an error
    if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.', status : 404 });
    }

    //Validation
    const validateBody = new ValidateBody();

    //Check if image is correct
    validateBody.imageValidator('image', true);
    //Check if name is correct
    validateBody.textValidator('name', true, 2, 255, 'Le nom', true);
    //Check if calories is correct
    validateBody.numberValidator('calories', true);
    //Check if proteins is correct
    validateBody.numberValidator('proteins', true);
    //Check if lipids is correct
    validateBody.numberValidator('lipids', true);
    //Check if glucids is correct
    validateBody.numberValidator('glucids', true);
    //Check if fibers is correct
    validateBody.numberValidator('fibers', true);
    //Check if calcium is correct
    validateBody.numberValidator('calcium', true);

    //Check the rules with data in body
    let valideBody = await validateBody.validateRules(req);

    // Check for validation errors
    if (!valideBody.isEmpty()) {
        // Return a JSON response with the determined status code
        return res.status(401).json({ errors: valideBody.array(), status: 401 });
    }
     
    //If there is no errors
    try {

        // Function for upload image
        req.body.image_path = uploadImage(req.file)('uploads/meals/');

        //Add user id in body
        req.body.id_user = user._id;

        //Create meal
        await Meal.create(req.body, res);

        //If popup is create return success
        res.status(201).json({ message: "Le repas a été correctement enregistré", status : 201 });
    } catch (error) {
        //If an error occurs, return an error
        res.status(500).json({ error: error, status: 500 });
    }
}

//////////
//////////