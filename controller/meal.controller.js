//////////
//REQUIRE
//Import meal model
const { isValidObjectId } = require('mongoose');
const Doctor = require('../models/Doctor');
const Meal = require('../models/Meal');
//Import user model
const User = require('../models/User');
const uploadImage = require('../utils/uploadImage');
//Import validateBody class for have an acces to validate rules
const ValidateBody = require('../utils/validateBody');
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
        return res.status(422).json({ errors: valideBody.array(), status: 422 });
    }
     
    //If there is no errors
    try {

        // Function for upload image
        req.body.image_path = uploadImage(req.file)('uploads/public/meals/');

        //Add user id in body
        req.body.id_user = user._id;

        //Create meal
        await Meal.create(req.body);

        //If meal is create return success
        res.status(201).json({ message: "Le repas a été correctement enregistré", status : 201 });
    } catch (error) {
        //If an error occurs, return an error
        res.status(500).json({ error: error, status: 500 });
    }
}

/**
 * Get the last meals for the user and return a JSON response.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {JSON} A JSON response with the recent meals and a status code
 */
exports.getLast = async (req, res) => {
     
    //Validation
    const user = await User.findById(req.user._id);
    // If the user does not exist, return an error
    if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.', status : 404 });
    }

    // Get the limit
    const limit = req.query.limit;
    // Stock the id_user in a variable
    let id_user = user._id;

    //Validation
    const validateBody = new ValidateBody();

    //Check if calcium is correct
    validateBody.numberValidator('limit', true, 0);

    if (user.role === "health") {
        // get the id of the user
        id_user = req.query.id;
        // Check if it valdie
        validateBody.validateObjectId('id_user',true);
    }

    // Create fake body for check validation
    const reqBody = { 
        body:{
            limit : limit,
            id_user : id_user
        }
    }

    //Check the rules with data in body
    let valideBody = await validateBody.validateRules(reqBody);

    // Check for validation errors
    if (!valideBody.isEmpty()) {
        // Return a JSON response with the determined status code
        return res.status(422).json({ errors: valideBody.array(), status: 422 });
    }
     
    //If there is no errors
    try {
        // If the user is a doctor
        if (user.role === "health") {
            // Check if he has authorized 
            const doctor = await Doctor.findOne({ id_user: user._id });
            if (!doctor.users_link.includes(id_user)) {
                // If not, return an error
                return res.status(403).json({ error: 'Vous n\'avez pas accès aux informations de cet utilisateur.', status : 403 });
            }
        }
    
        // Execute query
        const recentMeals = await Meal.find({ id_user: id_user })
        .sort({ created_at: -1 }).select('image_path name calories proteins lipids glucids fibers calcium created_at')
        .limit(limit);

        //If meal are correctly find return success
        res.status(200).json({ meals: recentMeals, status: 200 });
    } catch (error) {

        //If an error occurs, return an error
        res.status(500).json({ error: error, status: 500 });
    }
}

/**
+ * Delete a meal from the database based on the provided id.
+ *
+ * @param {Object} req - The request object containing the id of the meal to delete
+ * @param {Object} res - The response object to send back
+ * @return {Object} JSON object with a message indicating the result of the deletion operation
+ */
exports.delete = async (req, res) => {

    // Check if the id is valid
    if(!isValidObjectId(req.query.id)){
        return res.status(400).json({ error: 'Id invalide', status: 400 });
    }

    // Check if the meal exists and belongs to the user
    const meal = await Meal.findOne({_id : req.query.id, id_user : req.user._id});

    // If the meal does not exist, return an error
    if (!meal) {
        return res.status(404).json({ error: 'Repas non trouvé.', status : 404 });
    }
     
     // If there is no errors
    try {
        // try to delete this meal
        await Meal.findByIdAndDelete(req.query.id);

        //If meal is delete return success
        res.status(200).json({ message: "Le repas a été correctement supprimé", status : 200 });
        
    } catch (error) {
        // If an error occurs, return an error
        res.status(500).json({ error: error, status: 500 });
    }  
}

//////////
//////////