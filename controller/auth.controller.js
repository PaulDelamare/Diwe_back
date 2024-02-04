//////////
//REQUIRE
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { validationResult, check } = require('express-validator');
const bcrypt = require('bcryptjs');
//////////
//////////


//////////
//FUNCTION CONTROLLER
exports.create = async (req, res) => {

    //Validation
    const validationRules = [
        //Email is required and must be an unique email
        check('email').notEmpty().withMessage('L\'adresse e-mail est obligatoire').isEmail().withMessage('L\'adresse e-mail est invalide').normalizeEmail()
        .custom(async (value) => {
            // Check if the email already exists in the database
            const user = await User.findOne({ email: value });
            if (user) {
                throw new Error('L\'adresse e-mail est déjà utilisée.');
            }
            return true;
        })
        ,

        //Password must be between 6 and 20 characters, have an uppercase letter, number and special character
        check('password').isLength({ min: 6, max: 20 }).withMessage('Le mot de passe doit avoir entre 6 et 20 caractères').matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/).withMessage('Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial'),

        //First name is mandatory, must be a character string between 2 and 30 characters and only have letters
        check('firstname').notEmpty().withMessage('Le prénom est obligatoire').isString().withMessage('Le prénom doit être une chaîne de caractères').isLength({ min: 2, max: 30 }).withMessage('Le prénom doit avoir entre 2 et 30 caractères').matches(/^[a-zA-Z\s]+$/).withMessage('Le prénom ne doit contenir que des lettres et des espaces'),

        //Name is not mandatory, must be a character string between 2 and 30 characters and only have letters
        check('lastname').optional().isString().withMessage('Le nom doit être une chaîne de caractères').isLength({ min: 2, max: 30 }).withMessage('Le nom doit avoir entre 2 et 30 caractères').matches(/^[a-zA-Z\s]+$/).withMessage('Le nom ne doit contenir que des lettres et des espaces'),

        //Role is mandatory, must be user (patient), health (health professional) or blog (community manager)
        check('role').notEmpty().withMessage('Le rôle est obligatoire').isIn(['user', 'sante', 'blog']).withMessage('Le rôle doit être "user", "sante" ou "blog"'),

        //Date of birth is mandatory and must be a date in the correct format
        check('birthday').notEmpty().withMessage('La date de naissance est obligatoire').isISO8601().toDate().withMessage('La date de naissance est au mauvais format'),

        //Phone number is not required and must be a valid phone number
        check('phone').optional().isMobilePhone('any', {strictMode : false}).withMessage('Le numéro de téléphone doit être valide'),

        //Secret code is mandatory and must be a 6-digit number
        check('secret_pin').notEmpty().withMessage('Le code secret est obligatoire').isNumeric().withMessage('Le code secret doit être un nombre').isLength({ min: 6, max: 6 }).withMessage('Le code secret doit avoir exactement 6 chiffres')
    ];

    // Asynchronously apply all validation rules to the query fields
    await Promise.all(validationRules.map(validationRule => validationRule.run(req)));

    // Get the validation results for the query
    const errors = validationResult(req);

    // Check for validation errors
    if (!errors.isEmpty()) {
        // If errors are present, return a JSON response with code 422 Unprocessable Entity
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        //Hash password
        req.body.password = await bcrypt.hash(req.body.password, 10);

        //Create user and stock in variable
        const user = await User.create(req.body, res);

        //Store message in variable for update this if account is a doctor with with id_user null
        let message = "Utilisateur creé avec succes";

        //If role is "sante", create a doctor
        if (req.body.role === 'sante') {

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
            message: error.message || "Une erreur s'est produite lors de la création de l'utilisateur.",
            status : 500
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