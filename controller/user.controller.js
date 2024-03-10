//////////
//REQUIRE

//Import user model
const User = require('../models/User');
//Import popup model
const DailyPopup = require('../models/Popup');
// Import validateBody class for have an acces to validate rules
const ValidateBody = require('../utils/validateBody');
//Require fs (file system)
const fs = require('fs');
//Require path
const path = require('path');
//Import bcrypt for hash password
const bcrypt = require('bcryptjs');
//Import Request link model
const RequestLink = require('../models/RequestLink');
//Import Doctor model
const Doctor = require('../models/Doctor');

//////////
//////////

//////////
//FUNCTION CONTROLLER

//CHECK LAST CONNECTION
/**
+ *
+ * @param {Object} req - The request object
+ * @param {Object} res - The response object
+ * @return {Promise} JSON response indicating the result of the last connection check
+ */
exports.checkLastConnection = async (req, res) => {
    try {
        // Get user who execute the request
        const user = await User.findById(req.user._id);

        // If the user does not exist, return an error
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.', status : 404 });
        }

        // Stock in variable the current date
        const currentDate = new Date();

        // Update last_connection of the user
        await User.findByIdAndUpdate(user._id, { last_connection: currentDate }, { new: true });

        // If it's the first connection of the day for user
        if (!user.last_connection || new Date(user.last_connection).toDateString() !== currentDate.toDateString()) {
            //Find a random daily_popup
            const randomDailyPopup = await DailyPopup.aggregate([{ $sample: { size: 1 } }, { $project: { _id: 0, image_path: 1, text: 1 } }]);
            const dailyPopup = randomDailyPopup[0];
            // Return this popup 
            return res.status(200).json({ popup: dailyPopup, status: 200 });
        } else {
            // If is'nt the first connection of the day for user return message
            return res.status(200).json({ message: 'Vous vous êtes déjà connecté aujourd\'hui.', status: 200 });
        }
    } catch (error) {
        // If an error occurs, return an error
        console.error('Error in checkLastConnection:', error);
        return res.status(500).json({ error: 'Une erreur s\'est produite lors de la vérification de la dernière connexion.', status : 500 });
    }
};

//UPDATE PROFILE PICTURE

/**
+ *
+ * @param {Object} req - the request object
+ * @param {Object} res - the response object
+ * @return {Object} JSON response with the status code and message
+ */
exports.updateProfilePicture = async (req, res) => {

    // Get user who execute the request
    const user = await User.findById(req.user._id);

    // If the user does not exist, return an error
    if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.', status : 404 });
    }

    //Validation
    const validateBody = new ValidateBody();

    //Create rules
    validateBody.imageValidator('image', true);

    //Check the rules with data in body
    let valideBody = await validateBody.validateRules(req);

    // Check for validation errors
    if (!valideBody.isEmpty()) {
        // Return a JSON response with the determined status code
        return res.status(422).json({ errors: valideBody.array(), status: 422 });
    }

    try{

        //Id user have already an image, delete it
        if (user.profile_picture && user.profile_picture !== '') {
            // Build the path of the previous image
            const previousImagePath = path.join(__dirname, '..', user.profile_picture);  
            // Check if the image file exists
            if (fs.existsSync(previousImagePath)) {
                // Delete the previous image
                fs.unlink(previousImagePath, (error) => {
                    if (error) {
                        console.error('Erreur lors de la suppression de l\'image', error);
                        return res.status(500).json({ error: 'Une erreur s\'est produite lors de la suppression de l\'image précédente.', status: 500 });
                    }
                });
            }
        }
        //Stock in variable image 
        const uploadedImage = req.file;
        //get image extension
        const ext = path.extname(uploadedImage.originalname);
        //Rename image for security
        const fileName = `${Date.now()}-${uploadedImage.originalname.toLowerCase().replace(/[^a-z0-9]/g, '')}${ext}`;
        //Create image file path
        const imageFilePath = `uploads/profilePicture/${fileName}`;
        //Save image in image file path
        fs.writeFileSync(imageFilePath, uploadedImage.buffer);

        //Update user profile picture
        await User.findByIdAndUpdate(user._id, { profile_picture: imageFilePath, updated_at: Date.now() }, { new: true });
        
        //Return message if success
        return res.status(200).json({ message: 'La photo de profil a correctement été enregistré', status: 200 });

    }catch(e){
        console.error('Error in updateProfilePicture:', e);
        return res.status(500).json({ error: 'Une erreur s\'est produite lors de la mise à jour de la photo de profil.', status : 500 });
    }
}

//CHANGE INFORMATION
/**
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {Object} JSON response with the determined status code and the updated user data
 */
exports.changeInformation = async (req, res) => {
    // Get user who execute the request
    const user = await User.findById(req.user._id);

    // If the user does not exist, return an error
    if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.', status : 404 });
    }

    //Validation
    const validateBody = new ValidateBody();

    //Create rules
    validateBody.textValidator('firstname', true, 2, 30, 'Le prénom', false);
    validateBody.textValidator('lastname', true, 2, 30, 'Le nom', false);
    validateBody.birthdateValidator('birthdate', true);
    validateBody.phoneValidator('phone', false);

    //Check the rules with data in body
    let valideBody = await validateBody.validateRules(req);

    // Check for validation errors
    if (!valideBody.isEmpty()) {
        // Return a JSON response with the determined status code
        return res.status(422).json({ errors: valideBody.array(), status: 422 });
    }
    try{
        
        // Update user information in the database with the new data
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user._id },
            {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                birthdate: req.body.birthdate,
                phone: req.body.phone,
                updated_at: Date.now()
            },
            { new: true, select: 'firstname lastname birthdate phone' }
        );

        // Return a JSON response with the determined status code and the updated user data
        return res.status(200).json({ message: 'Informations utilisateur mises à jour avec succès.', status: 200, user: updatedUser });
    }catch(e){
        // If an error occurs, return a response with the status code 500
        return res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour des informations utilisateur.', status: 500 });
    }
    
}

//CHANGE USER PASSWORD
/**
+ *
+ * @param {Object} req - the request object
+ * @param {Object} res - the response object
+ * @return {Promise} a JSON response with the determined status code
+ */
exports.changePassword = async (req, res) => {

    // Get user who execute the request
    const user = await User.findById(req.user._id);

    // If the user does not exist, return an error
    if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.', status : 404 });
    }

    //Validation
    const validateBody = new ValidateBody();

    //Create rules
    validateBody.passwordValidator('password');
    validateBody.passwordValidator('newPassword');

    //Check the rules with data in body
    let valideBody = await validateBody.validateRules(req);

    // Check for validation errors
    if (!valideBody.isEmpty()) {
        // Return a JSON response with the determined status code
        return res.status(422).json({ errors: valideBody.array(), status: 422 });
    }

    //Check if password is correct
    validateBody.checkPassword('password', user);

    //Check the rules with data in body
    valideBody = await validateBody.validateRules(req);

    // Check for validation errors
    if (!valideBody.isEmpty()) {
        // Return a JSON response with the determined status code
        return res.status(401).json({ errors: valideBody.array(), status: 401 });
    }
    try {

        // Hach the new password
        const hashedNewPassword = await bcrypt.hash(req.body.newPassword, 10);

        //Update user password
        await User.findOneAndUpdate(
            { _id: req.user._id },
            { password: hashedNewPassword, updated_at: Date.now() },
            { new: true }
        );

        // Return succes 
        return res.status(200).json({ message: 'Mot de passe changé avec succès.', status: 200 });

    }catch(e){
        console.error('Error in changePassword:', e);
        return res.status(500).json({ error: 'Une erreur s\'est produite lors de la modification du mot de passe.', status : 500 });
    }
}

//CHANGE USER EMAIL
/**
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Object} JSON response with the determined status code
 */
exports.changeEmail = async (req, res) => {
    const user = await User.findById(req.user._id);

    // If the user does not exist, return an error
    if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.', status : 404 });
    }

    //Validation
    const validateBody = new ValidateBody();

    //Create rules
    validateBody.passwordValidator('password');
    validateBody.emailValidator('email', true, true, false);

    //Check the rules with data in body
    let valideBody = await validateBody.validateRules(req);

    // Check for validation errors
    if (!valideBody.isEmpty()) {
        // Return a JSON response with the determined status code
        return res.status(422).json({ errors: valideBody.array(), status: 422 });
    }

    //Check if password is correct
    validateBody.checkPassword('password', user);

    //Check the rules with data in body
    valideBody = await validateBody.validateRules(req);

    if (!valideBody.isEmpty()) {
        // Return a JSON response with the determined status code
        return res.status(401).json({ errors: valideBody.array(), status: 401 });
    }
    try{
        //If all is correct, update email
        await User.findByIdAndUpdate(req.user._id, { email: req.body.email, updated_at: Date.now() });

        //Return message if success
        return res.status(200).json({ message: 'Adresse e-mail mise à jour avec succès.', status: 200, "reconnect_required": true });
    }catch(e){
        //If an error occurs, send an error message
        return res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour de l\'adresse e-mail.', status: 500 });
    }
}

//CANCEL DELETE USER

/**
+ * Request deletion for the user with the given user ID in the request (JWT).
+ *
+ * @param {Object} req - The request object
+ * @param {Object} res - The response object
+ * @return {Promise} A Promise that resolves to the result of the deletion request
+ */
exports.requestDeletion = async (req, res) => {
    //Find user last information with the id user in req (jwt)
    const user = await User.findById(req.user._id);

    // If the user does not exist, return an error
    if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.', status : 404 });
    }
    try{
        //If all is correct, update request_deletion
        await User.findByIdAndUpdate(req.user._id, { request_deletion: user.request_deletion == null ? Date.now() : null, updated_at: Date.now() });

        //If all is correct, return message
        return res.status(200).json({ message: `Demande de suppression ${user.request_deletion == null ? 'envoyée avec succès.' : 'annulé'}`, status: 200 });
    }catch(e){
        //If an error occurs, send an error message
        return res.status(500).json({ error: 'Une erreur est survenue lors de la demande de suppression du compte', status: 500 });
    }  
}

/**
+ * Request link to doctor with the given link_code in the request (JWT). Stock in colletion the request
+ *
+ * @param {Object} req - The request object
+ * @param {Object} res - The response object
+ * @return {Promise} A Promise that resolves to the result of the deletion request
+ */
exports.requestLink = async (req, res) => {
    //Find user last information with the id user in req (jwt)
    const user = await User.findById(req.user._id);

    // If the user does not exist, return an error
    if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.', status : 404 });
    }

    //Validation
    const validateBody = new ValidateBody();

    //Check if password is correct
    validateBody.linkCodeValidator('link_code', true);

    //Check the rules with data in body
    let valideBody = await validateBody.validateRules(req);

    if (!valideBody.isEmpty()) {
        // Return a JSON response with the determined status code
        return res.status(401).json({ errors: valideBody.array(), status: 401 });
    }

    // Find Doctor who have the same link_code
    const doctor = await Doctor.findOne({ binding_code: req.body.link_code });

    // If the dotcor does not exist, return an error
    if (!doctor) {
        return res.status(404).json({ error: 'Spécialiste de santé non trouvé.', status : 404 });
    }

    const allReadyExist =  await RequestLink.findOne({ id_user: user._id, id_doctor: doctor._id });

    if(allReadyExist){
        return res.status(409).json({ error: 'Vous avez déjà envoyé une demande de liaison de compte.', status : 409 });
    }

    try{
        //If all is correct create request
        await RequestLink.create({ id_user: user._id, id_doctor: doctor._id });

        //If all is correct, return message
        return res.status(201).json({ message: `Votre demande de liaison de compte a bien été enregistré`, status: 201 });
    }catch(e){
        //If an error occurs, send an error message
        return res.status(500).json({ error: 'Une erreur est survenue lors de la demande de liaison de compte', status: 500 });
    }  
}


/**
+ * Get request link doctor in function of user
+ *
+ * @param {Object} req - the request object
+ * @param {Object} res - the response object
+ * @return {Promise} a Promise that resolves to the result of the function
+ */
exports.findRequestLinkUser = async (req, res) => {

    //Find user last information with the id user in req (jwt)
    const user = await User.findById(req.user._id);

    // If the user does not exist, return an error
    if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.', status : 404 });
    }

    try{

        //Find all requests for user with id_user
        const requestsWithDoctors = await RequestLink.aggregate([
            {
                // FInd all requests for user
                $match: { id_user: user._id }
            },
            {
                // Find doctor linked to the id_doctor
                $lookup: {
                    from: 'doctor',
                    localField: 'id_doctor',
                    foreignField: '_id',
                    as: 'doctor',
                    // Find only doctor data that we need
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
                    _id: 0,
                    status: 1,
                    created_at: 1,
                    doctor:1
                }
            }
        ]);

        //If succes, return requests or empty
        return res.status(200).json({ requests: requestsWithDoctors, status:200 });
    }catch(e){

        //If an error occurs, send an error message
        return res.status(500).json({ error: 'Une erreur est survenue lors de la recherche des requêtes.', status: 500 });
    }
}

//////////
//////////
