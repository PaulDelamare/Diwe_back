//////////
//REQUIRE
//Import medical data model
const Doctor = require('../models/Doctor');
const MedicalData = require('../models/MedicalData');
// Import user model
const User = require('../models/User');
//Import validateBody class for have an acces to validate rules
const ValidateBody = require('../utils/validateBody');
//////////
//////////

//////////
//FUNCTION CONTROLLER 

/**
+ * Handle the posting of user medical data.
+ *
+ * @param {Object} req - The request object
+ * @param {Object} res - The response object
+ * @return {Promise<void>} A promise that resolves with the result of the operation
+ */
exports.postUserMedicalData = async (req, res) => {

    //Validation
    //Instance validateBody
    const validateBody = new ValidateBody();

    //Validation
    validateBody.numberValidator('pulse', true);
    validateBody.validateObjectId('id_user', true);

    //Validate rules
    const valideBody = await validateBody.validateRules(req);

    //If one rule is'nt valid, return error
    if (!valideBody.isEmpty()) {
        // If errors are present, return a JSON response with code 422 Unprocessable Entity
        return res.status(422).json({ errors: valideBody.array(), status : 422 });
    }

    // Get id_user
    const user = await User.findById(req.body.id_user);
    // if user is not found
    if (!user) {
        // Return error
        return res.status(404).json({ error: 'Utilisateur non trouvé', status : 404 });
    }

    try {
        // Add in db the medical data
        await MedicalData.create({
            id_user: req.body.id_user,
            pulse: req.body.pulse,
        });

        // If success, return a JSON response with code 201 Created
        res.status(201).json({ message: 'Données médicales enregistrées', status : 201 });
    } catch (error) {
        // If an error occurs, return a JSON response with code 500 Internal Server Error
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement des données', status : 500 }); 
    }
}

/**
+ * Get user's medical information based on the provided request and response objects.
+ *
+ * @param {Object} req - The request object containing user information.
+ * @param {Object} res - The response object to send back the medical information.
+ * @return {Object} - Returns the medical data for the user or an error response.
+ */
exports.getUserMedicalInformation = async (req, res) => {
    // Get id_user
    const user = await User.findById(req.user._id);
    // if user is not found
    if (!user) {
        // Return error
        return res.status(404).json({ error: 'Utilisateur non trouvé', status : 404 });
    }

    //Validation
    //Instance validateBody
    const validateBody = new ValidateBody();

    //Validation
    validateBody.numberValidator('limit', true, 0);

    // If user id doctor
    if (user.role === "health") {
        validateBody.validateObjectId('id_user', true);
    }
    
    // pass in fake body the data to check
    const reqBody = {
        body : {
            limit : req.query.limit,
            id_user : req.query.id || user._id
        }
    }
    //Validate rules
    const valideBody = await validateBody.validateRules(reqBody);

    //If one rule is'nt valid, return error
    if (!valideBody.isEmpty()) {
        // If errors are present, return a JSON response with code 422 Unprocessable Entity
        return res.status(422).json({ errors: valideBody.array(), status : 422 });
    }

    // If user is doctor
    if (user.role === "health") {
        // Find his doctor information
        const doctor = await Doctor.findOne({id_user: user._id});
        // If doctor is not found
        if (!doctor) {
            // Return error
            return res.status(404).json({ error: 'Docteur non trouvé', status : 404 });
        }
        // If doctor isn't linked to the user
        if (!doctor.users_link.includes(reqBody.body.id_user)) {
            // Return error
            return res.status(401).json({ error: 'Utilisateur non trouvé', status : 401 }); 
        }
    }

    try {
        // Get medical data
        const medicalData = await MedicalData.find({ id_user : reqBody.body.id_user }).sort({ date: -1 }).limit(reqBody.body.limit);
        // return data
        res.status(200).json({ data : medicalData, status : 200 });
        
    } catch (error) {
        // If an error occurs, return a JSON response with code 500 Internal Server Error
        res.status(500).json({ error: error, status : 500 });
    }
}

//////////
//////////