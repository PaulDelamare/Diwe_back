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
const { isValidObjectId } = require('mongoose');
const sendEmail = require('../utils/sendEmail');
const Meal = require('../models/Meal');
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
        return res.status(404).json({ error: 'Professionnel non trouvé.', status : 404 });
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

    // Check if the id is valid
    if(!isValidObjectId(req.query.id)){
        return res.status(400).json({ error: 'Id invalide', status: 400 });
    }

    //Validation
    const validateBody = new ValidateBody();

    //Check if boolean is correct
    validateBody.booleanFieldsValidator('validate');
    
    //Check the rules with data in body
    let valideBody = await validateBody.validateRules(req);

    if (!valideBody.isEmpty()) {
        // Return a JSON response with the determined status code
        return res.status(422).json({ errors: valideBody.array(), status: 422 });
    }

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
        return res.status(404).json({ error: 'Professionnel non trouvé.', status : 404 });
    }

    //Find the request with id
    const requestValidate = await RequestLink.findOne({_id : req.query.id, id_doctor : doctor._id} );
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

    // Check if user already link
    const doctorLink = doctor.users_link.includes(requestValidate.id_user);
    const userLink = userRequest.doctors_link.includes(doctor._id);

    // If the user already link, return an error
    if (doctorLink || userLink) {
        return res.status(409).json({ error: 'Vous êtes déjà lié.', status : 409 });
    }

    try {

        // update the request status
        await RequestLink.updateOne({ _id: req.query.id }, { $set: { status: req.body.validate ? 'accepted' : 'refused', reponse_date : new Date() } });

        // If the request are validated by the doctor
        if (req.body.validate) {
            await Doctor.updateOne({ _id: doctor._id }, { $push: { users_link: requestValidate.id_user } });
            await User.updateOne({ _id: requestValidate.id_user }, { $push: { doctors_link: doctor._id } });
        }
        // Pass the custom data to the email template
        const emailData = {
            firstname: userRequest.firstname,
            doctor: doctor.email,
            accepted : req.body.validate ? 'a été acceptée' : 'a été refusée',
            emailService: process.env.EMAIL_SERVICE
        }

        // Send email for inform user that he has been linked with doctor
        await sendEmail(userRequest.email,  process.env.EMAIL_SENDER, `${req.body.validate ? 'Requête de liaison validé' : 'Requête de liaison refusé'}`, 'doctor/response-request', emailData);

        // If the try is ok, return a JSON response
        return res.status(200).json({ message: `${req.body.validate ? 'La requête a été validé' : 'La requête a été refusé'}`, status : 200 });
    } catch (error) {

        // If an error occur, return this error
        return res.status(500).json({ error: error, status : 500 });
    }
}

/**
+ * Retrieves the user information linked to the authenticated doctor.
+ *
+ * @param {Object} req - The request object
+ * @param {Object} res - The response object
+ * @return {Promise} The result of the doctor information retrieval
+ */
exports.getUsersLink = async (req, res) => {

    //Find user last information with the id user in req (jwt)
    const user = await User.findById(req.user._id);

    // If the user does not exist, return an error
    if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.', status : 404 });
    }

    // Get doctor information
    const doctor = await Doctor.findOne({ id_user: user._id });

    // If the doctor does not exist, return an error
    if (!doctor) {
        return res.status(404).json({ error: 'Professionnel non trouvé.', status : 404 });
    }

    try {
        // Find all users linked to the doctor
        const users = await User.find({ _id: { $in: doctor.users_link } }, { _id: 1, firstname: 1, lastname: 1, email: 1, phone: 1 });

        //If succes, return users
        return res.status(200).json({ users: users, status:200 });
    } catch (error) {
        //If an error occurs, send an error message
        return res.status(500).json({ error: 'Une erreur est survenue lors de la recherche des professionnels.', status: 500 });
    }
}

/**
+ * Get single user information based on the request user ID and return the user's information, last meal, and health signals if successful, otherwise return an error message.
+ *
+ * @param {Object} req - The request object
+ * @param {Object} res - The response object
+ * @return {Object} JSON object containing user information, last meal, and status code
+ */
exports.getSingleUser = async (req, res) => {

    //Find user last information with the id user in req (jwt)
    const user = await User.findById(req.user._id);

    // If the user does not exist, return an error
    if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.', status : 404 });
    }

    // get the id in url
    const id_user = req.query.id;
    if (!isValidObjectId(id_user)) {
        // if id isn't valid, return error
        return res.status(400).json({ error: 'Utilisateur non trouvé.', status : 400 });
    }

    // Get doctor information
    const doctor = await Doctor.findOne({ id_user: user._id });

    // If the doctor does not exist, return an error
    if (!doctor) {
        return res.status(404).json({ error: 'Professionnel non trouvé.', status : 404 });
    }

    if (!doctor.users_link.includes(id_user)) {
        return res.status(403).json({ error: 'Vous n\'avez pas la permission de consulter cet utilisateur.', status : 403 });
    }

    try {
        // Find user
        const user = await User.findOne({ _id: id_user }, { _id: 1, firstname: 1, lastname: 1, email: 1, phone: 1, birthday: 1 });
        // Get the last user meal
        const lastMeal = await Meal.findOne({ id_user: id_user }).sort({ created_at: -1 });
        //TODO 
        // Get the user health signal
        // const signals = await Signal.find({ id_user: id_user }).sort({ created_at: -1 }).limit(20);

        //If succes, return users
        return res.status(200).json({ user: user, lastMeal: lastMeal, status:200 });

    } catch (error) {
        // If an error occurs, send an error message
        return res.status(500).json({ error: 'Une erreur est survenue lors de la recherche des informations utilisateurs', status: 500 });
    }
        
}

//////////
//////////