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
//////////
//////////

//////////
//FUNCTION CONTROLLER

//Create user
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
        return res.status(422).json({ errors: valideBody.array() });
    }

    try {
        //Hash password
        req.body.password = await bcrypt.hash(req.body.password, 10);

        //Create user and stock in variable
        const user = await User.create(req.body, res);

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
                await Doctor.create(req.body, res);
            }
        }

        //If user (and doctor) is create return success
        res.status(201).json({ 
            message: message,
            status : 201
         });

    } catch (error) {

        //If an error occurs, send an error message
        res.status(500).json({
            error: error.message || "Une erreur s'est produite lors de la création de l'utilisateur.",
            status : 401
        });
    }
}

//Login user
exports.login = async (req, res) => {
    try {
        //Validation
        const validateBody = new ValidateBody();

        //Create rules
        await validateBody.emailValidator('email', true, false, true);
        validateBody.passwordValidator('password');

        //Check the rules with data in body
        let valideBody = await validateBody.validateRules(req);

        // Check for validation errors
        if (!valideBody.isEmpty()) {
            // Return a JSON response with the determined status code
            return res.status(400).json({ errors: valideBody.array() });
        }

        //Get user with email
        const user = await User.findOne({ email: req.body.email });

        //Check if password is correct
        validateBody.checkPassword('password', user);

        //Check the rules with data in body
        valideBody = await validateBody.validateRules(req);

        // Check for validation errors
        if (!valideBody.isEmpty()) {
            // Return a JSON response with the determined status code
            return res.status(400).json({ errors: valideBody.array() });
        }

        //Create jwt token
        const token = jwt.sign({email: user.email}, process.env.JWT_SECRET);

        //Response with token and status
        res.status(200).json({
            jwt : token,
            status : 200
        });
    } catch (error) {

        //If an error occurs, send an error message
        res.status(401).json({
            message : e.message,
            status : 401
        });
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

//////////
//////////