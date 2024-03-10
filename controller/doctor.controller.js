//////////
//REQUIRE
//Import User model
const User = require('../models/User');
//Import Doctor model
const Doctor = require('../models/Doctor');
//Import validateBody class for have an acces to validate rules
const ValidateBody = require('../utils/validateBody');
//Import Request link model
const RequestLink = require('../models/RequestLink');
//////////
//////////

//////////
//FUNCTION CONTROLLER

/**
+ * Get all requests link for doctor
+ *
+ * @param {Object} req - the request object
+ * @param {Object} res - the response object
+ * @return {Object} JSON response with success or error message
+ */
exports.getRequestLink = async (req, res) => {
    //Find user last information with the id user in req (jwt)
    const user = await User.findById(req.user._id);

    // If the user does not exist, return an error
    if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.', status : 404 });
    }

    //Get doctor information
    const doctor = await Doctor.findOne({ id_user: user._id });

    // If the user does not exist, return an error
    if (!doctor) {
        return res.status(404).json({ error: 'Professionel non trouvé.', status : 404 });
    }
    try {
        const requestsWithUsers = await RequestLink.aggregate([
            {
                // FInd all requests for user
                $match: { id_doctor: doctor._id }
            },
            {
                // Find user linked to the id_doctor
                $lookup: {
                    from: 'user',
                    localField: 'id_user',
                    foreignField: '_id',
                    as: 'users',
                    // Find only user data that we need
                    pipeline: [
                        {
                          $project: {
                            _id: 0,
                            lastname: 1,
                            firstname: 1,
                            email: 1,
                            phone: 1
                          }
                        }
                      ]
                }
            },
            {
                // Select data that we need in the result
                $project: {
                    _id: 1,
                    status: 1,
                    created_at: 1,
                    users:1
                }
            }
        ]);

        //Return requests 
        return res.status(200).json({ requests:requestsWithUsers, status : 200 });
    } catch (error) {
        //If an error occur, return this error
        return res.status(500).json({ error: error, status : 500 });
    }
}

/**
+ * Validate or refuse a request link between a doctor and a patient
+ * 
+ * @param {express.Request} req - The request
+ * @param {express.Response} res - The response
+ * 
+ * @returns {JSON} - A JSON response with a message
+ */
exports.validateRequestLink = async (req, res) => {

    //////////
    //GET DATA INFORMATION FROM DATA BASE
    //Find user last information with the id user in req (jwt)
    const user = await User.findById(req.user._id);

    // If the user does not exist, return an error
    if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.', status : 404 });
    }

    //Get doctor information
    const doctor = await Doctor.findOne({ id_user: user._id });

    // If the user does not exist, return an error
    if (!doctor) {
        return res.status(404).json({ error: 'Professionel non trouvé.', status : 404 });
    }

    //Find the request with id
    const requestValidate = await RequestLink.findOne({_id : req.body.id, id_doctor : doctor._id} );
    // If the user does not exist, return an error
    if (!requestValidate) {
        return res.status(404).json({ error: 'Cette requête n\'existe pas.', status : 404 });
    }

    const userRequest = await User.findById(requestValidate.id_user);

    // If the user does not exist, return an error
    if (!userRequest) {
        return res.status(404).json({ error: 'Cette utilisateur n\'existe pas ou plus.', status : 404 });
    }

    //////////
    //////////

    //Validation
    const validateBody = new ValidateBody();

    //Check if boolean is correct
    validateBody.booleanFieldsValidator('validate');
    
    //Check the rules with data in body
    let valideBody = await validateBody.validateRules(req);

    if (!valideBody.isEmpty()) {
        // Return a JSON response with the determined status code
        return res.status(401).json({ errors: valideBody.array(), status: 401 });
    }

    // Check if user already link
    const alreadyLink = doctor.users_link.includes(requestValidate.id_user);

    // If the user already link, return an error
    if (alreadyLink) {
        return res.status(401).json({ error: 'Vous êtes déjà lié.', status : 401 });
    }

    try {

        // update the request status
        await RequestLink.updateOne({ _id: req.body.id }, { $set: { status: req.body.validate ? 'accepted' : 'refused', reponse_date : new Date() } });

        // If the request are validated by the doctor
        if (req.body.validate) {
            await Doctor.updateOne({ _id: doctor._id }, { $push: { users_link: requestValidate.id_user } });
            await User.updateOne({ _id: requestValidate.id_user }, { $push: { doctors_link: doctor._id } });
        }

        // If the try is ok, return a JSON response
        return res.status(200).json({ message: `${req.body.validate ? 'La requête a été validé' : 'La requête a été refusé'}`, status : 200 });
    } catch (error) {

        // If an error occur, return this error
        return res.status(500).json({ error: error, status : 500 });
    }
}

//////////
//////////