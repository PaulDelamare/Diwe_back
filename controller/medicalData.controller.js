//////////
//REQUIRE
//Import medical data model
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
    validateBody.numberValidator('oxygen', true);
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
            oxygen: req.body.oxygen
        });

        // If success, return a JSON response with code 201 Created
        res.status(201).json({ message: 'Données médicales enregistrées', status : 201 });
    } catch (error) {
        // If an error occurs, return a JSON response with code 500 Internal Server Error
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement des données', status : 500 }); 
    }
}

//////////
//////////