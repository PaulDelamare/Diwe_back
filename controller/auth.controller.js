//////////
//REQUIRE
//Import user model
const User = require('../models/User');
//Import doctor model
const Doctor = require('../models/Doctor');
//Import bcrypt for hash password
const bcrypt = require('bcryptjs');
//Import validateBody class for have an acces to validate rules
const ValidateBody = require('../utils/validateBody');
//Import jwt for create token
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
//Require .env for email sender
require('dotenv').config();
//Uuid for check the token in email
const { validate: isUuid, v4: uuidv4 } = require('uuid');
//Speakeasy for generate secret code
const speakeasy = require('speakeasy');
// Require verification code model
const VerificationCode = require('../models/VerificationCode');
const Meal = require('../models/Meal');
//////////
//////////

//////////
//FUNCTION CONTROLLER

//CREATE USER
/**
+ *
+ * @param {Object} req - The request object containing user data
+ * @param {Object} res - The response object for sending the response
+ * @return {Object} JSON response with the status and message
+ */
exports.create = async (req, res) => {

    //Validation
    //Instance validateBody
    const validateBody = new ValidateBody();

    //Validation
    validateBody.emailValidator('email', true, true, false);
    validateBody.passwordValidator('password');
    validateBody.textValidator('firstname', true, 2, 30, 'Le prénom');
    validateBody.textValidator('lastname', false, 2, 30, 'Le nom');
    validateBody.roleValidator('role', true);
    validateBody.birthdateValidator('birthday', true);
    validateBody.phoneValidator('phone', false);
    validateBody.secretPinValidator('secret_pin', true, 6);

    //Validate rules
    const valideBody = await validateBody.validateRules(req);

    //If one rule is'nt valid, return error
    if (!valideBody.isEmpty()) {
        // If errors are present, return a JSON response with code 422 Unprocessable Entity
        return res.status(422).json({ errors: valideBody.array(), status: 422 });
    }

    try {
        //Hash password
        req.body.password = await bcrypt.hash(req.body.password, 10);

        //Create user and stock in variable
        const user = await User.create(req.body);

        //Store message in variable for update this if account is a doctor with with id_user null
        let message = "Utilisateur creé avec succes";

        //If role is "health", create a doctor
        if (req.body.role === 'health') {

            //Check if doctor already exist
            const existingDoctor = await Doctor.findOne({ email: req.body.email });

            if(existingDoctor) {
                //If doctor exist and id_user is not null, throw an error
                if (existingDoctor.id_user) {
                    throw new Error('L\'adresse e-mail est déjà utilisée doctor.');
                }else{
                    //Else if doctor exist and id_user is null, send email for linked account

                    //TODO
                    //Send email to verify doctor

                    //Update message for response
                    message = "Un utilisateur à crée un professionel de la santé avec cette email. Un email de confirmation vous a été envoyé pour confirmer votre identité et lié votre compte."
                }   
            }else{

                //Add id user for linked to doctor
                req.body.id_user = user._id;

                //Create random binding code
                let bindingCode;
                do {
                    //Generate random code
                    bindingCode = generateRandomCode();

                    //Check if code already exists
                } while (await Doctor.exists({ binding_code: bindingCode }));

                //Add binding code in body
                req.body.binding_code = bindingCode;

                //Create doctor
                await Doctor.create(req.body);
            }
        }
        const emailData = {
            firstname: req.body.firstname,
            email: req.body.email,
            token : user.token
        }
        sendEmail(req.body.email,  process.env.EMAIL_SENDER, 'Validation de votre compte', 'validateEmail/validate-account', emailData );

        //If user (and doctor) is create return success
        res.status(201).json({ 
            message: message,
            status : 201
         });

    } catch (error) {

        //If an error occurs, send an error message
        res.status(500).json({
            error: error.message || "Une erreur s'est produite lors de la création de l'utilisateur.",
            status : 500
        });
    }
}

//LOGIN USER
/**
+ *
+ * @param {Object} req - the request object
+ * @param {Object} res - the response object
+ * @return {Object} JSON response with the access token and user information
+ */
exports.login = async (req, res) => {

    //Validation
    const validateBody = new ValidateBody();

    //Create rules
    validateBody.emailValidator('email', true, false, true);
    validateBody.passwordValidator('password');

    //Check the rules with data in body
    let valideBody = await validateBody.validateRules(req);

    // Check for validation errors
    if (!valideBody.isEmpty()) {
        // Return a JSON response with the determined status code
        return res.status(422).json({ errors: valideBody.array(), status: 422 });
    }

    try {
        // Check user information
        //Get user with email
        const user = await User.findOne({ email: req.body.email });

        //Check if password is correct
        validateBody.checkPassword('password', user);

        //Check the rules with data in body
        valideBody = await validateBody.validateRules(req);

        // Check for validation errors
        if (!valideBody.isEmpty()) {
            // Return a JSON response with the determined status code
            return res.status(401).json({ errors: valideBody.array(), status: 401 });
        }

        // If there is already one code, remove it
        await VerificationCode.findOneAndDelete({ email: user.email });

        //generate secret for the code
        const secret = speakeasy.generateSecret({ length: 20 });
        // Generate code
        const verificationCode = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
        });

        // Add expiration time 
        const codeExpiration = new Date();
        codeExpiration.setMinutes(codeExpiration.getMinutes() + 10);

        // Create code
        await VerificationCode.create({
            email: user.email,
            code: verificationCode,
            expiresAt: codeExpiration,
        });

        // Stock variable to pass in email
        const emailData = {
            firstname: user.firstname,
            email: user.email,
            code: verificationCode
        }

        // Send email with code
        await sendEmail(user.email,  process.env.EMAIL_SENDER, 'Code de verification', 'twoFactor/send-code', emailData);

        // return success
        res.status(200).json({
            message: 'Un code de vérification a été envoyé à votre adresse e-mail.',
            status: 200,
        });

    } catch (error) {
        //If an error occurs, send an error message
        res.status(500).json({
            message : error.message,
            status : 500
        });
    }
}

/**
+ * Function to verify a code provided by the user.
+ *
+ * @param {Object} req - The request object containing user data.
+ * @param {Object} res - The response object to send back the result.
+ * @return {Object} JSON response with the result of the code verification process.
+ */
exports.verifyCode = async (req, res) => {

    //Validation
    const validateBody = new ValidateBody();

    //Create rules
    validateBody.emailValidator('email', true, false, true);
    validateBody.numberValidator('code', true);

    //Check the rules with data in body
    let valideBody = await validateBody.validateRules(req);

    // Check for validation errors
    if (!valideBody.isEmpty()) {
        // Return a JSON response with the determined status code
        return res.status(422).json({ errors: valideBody.array(), status: 422 });
    }

    //If fields are valid
    try {
        //Stock in variable email and code
        const { email, code } = req.body;

        // Get verification code by email
        const verificationCode = await VerificationCode.findOne({
            email: email,
        });

        // If there is no verification code, return an error
        if (!verificationCode) {
            return res.status(400).json({
                message: 'Aucun code de vérification trouvé.',
                status: 400,
            });
        }

        // If the code is not the same as the one in the database or the code has expired, return an error
        if (verificationCode.code !== code || verificationCode.expiresAt < new Date()) {
            return res.status(400).json({
                message: 'Code de vérification invalide ou expiré.',
                status: 400,
            });
        }

        
        // Remove the verification code from the database
        await VerificationCode.findByIdAndDelete(verificationCode._id);
        
        // Find the user information
        const user = await User.findOne({ email: email });

        // Create the jwt token 
        const token = jwt.sign({email: user.email}, process.env.JWT_SECRET);

        // Stock in varaibel information to pass in email
        const emailData = {
            firstname: user.firstname,
            emailService: process.env.EMAIL_SERVICE,
        }
        // Send an email to indicate that a connection to the account has just taken place 
        await sendEmail(user.email,  process.env.EMAIL_SENDER, 'Connexion à votre compte', 'twoFactor/connection-made', emailData);

        const meal = await Meal.findOne({ id_user: user._id }, { _id: 0, __v: 0, id_user: 0 }).sort({ date: -1 });

        // Return user infromation
        res.status(200).json({
            access_token : token,
            user : {
                firstname : user.firstname,
                lastname : user.lastname,
                email : user.email,
                role : user.role,
                phone : user.phone,
                profile_picture : user.profile_picture,
                last_meal : meal ? meal : null,
                secret_pin : user.secret_pin
            },
            status : 200
        });
        
    } catch (error) {
        // If an error occurs, send an error message
        res.status(500).json({ error : error, status : 500 });    
    }
}

/**
+ * Validate an account by email and token.
+ *
+ * @param {object} req - The request object
+ * @param {object} res - The response object
+ * @return {Promise<void>} Promise that resolves when the account is validated
+ */
exports.validateAccount = async (req, res) => {
    
    //Get email and token from params
    const email = req.params.email;
    const token = req.params.token;

    //Validate email and token
    validateEmailAndToken(email, token);

    //Pass in emaildata the email service
    let emailData = {
        emailService : process.env.EMAIL_SERVICE
    }

    //Get user with email
    const user = await User.findOne({ email, token });
    //Check if user exist
    if (!user) {
        
        //Send error in email
        return res.redirect('https://www.needfor-school.com/');
    }

    //Add firstname if user exist
    emailData.firstname = user.firstname;

    //Try to update user
    try {
        //Update user
        await User.findOneAndUpdate( { email, token }, { active: true, token: uuidv4() }, { new: true } );

        // If the account is active, return email for validate to user
        sendEmail(user.email,  process.env.EMAIL_SENDER, 'Compte validé', 'validateEmail/validate-success', emailData);
        res.redirect('https://www.needfor-school.com/');
    } catch (error) {
        //If an error occurs, send an error message
        console.log(error);
        sendEmail(email,  process.env.EMAIL_SENDER, 'Une erreur s\'est produite', 'validateEmail/validate-fail', );
        res.redirect('https://www.needfor-school.com/');
    }
}

/**
+ * Resends an email to the user for account validation.
+ *
+ * @param {Object} req - The request object.
+ * @param {Object} res - The response object.
+ * @return {Object} The response object with a message and status code.
+ */
exports.resendEmail = async (req, res) => {

    //Validation
    const validateBody = new ValidateBody();

    //Create rules
    validateBody.emailValidator('email', true, false, true);

    //Check the rules with data in body
    let valideBody = await validateBody.validateRules(req);

    // Check for validation errors
    if (!valideBody.isEmpty()) {
        // Return a JSON response with the determined status code
        return res.status(422).json({ errors: valideBody.array(), status: 422 });
    }

    //Get user with email
    const user = await User.findOne({ email: req.body.email });

    //Check if user exist
    if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé', status: 404 });
    }

    // If the account is active, return error for validate to user
    if (user.active !== false) {
        return res.status(409).json({ message: 'Cet email est déjà validé', status : 409 });
    }

    //Pass in emaildata the information in email
    const emailData = {
        firstname: user.firstname,
        email: user.email,
        token : user.token,
        emailService : process.env.EMAIL_SERVICE
    }
    try {
        //Send email for validate to user
        sendEmail(user.email,  process.env.EMAIL_SENDER, 'Validation de votre compte', 'validateEmail/validate-account', emailData );
        //Return succes message
        res.status(200).json({ message: 'Email envoyé', status: 200 });
    } catch (error) {
        //If an error occurs, send an error message
        sendEmail(user.email,  process.env.EMAIL_SENDER, 'Une erreur s\'est produite', 'validateEmail/validate-fail', emailData);
        res.status(500).json({ message: error.message, status: 500 });
    }
}

//////////
//////////

//////////
//OTHER FUNCTIONS

/**
 * Generates a random code.
 *
 * @return {number} the randomly generated code
 */
function generateRandomCode() {
    return Math.floor(1000000000 + Math.random() * 9000000000);
}


/**
+ * Validate email and token from email
+ *
+ * @param {string} email - email address to validate
+ * @param {string} token - token to validate
+ */
function validateEmailAndToken(email, token) {
    // Check if the email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email address');
    }
  
    // Check if the uuid is valdie
    if (!isUuid(token)) {
        throw new Error('Invalid token');
    }
  }
  

//////////
//////////