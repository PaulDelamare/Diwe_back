//////////
//REQUIRE
const { validationResult, check } = require('express-validator');
const User = require('../models/User');

//////////
//////////


// exports.validateBody = async (validationRules, req, res, notFoundMessage = "") => {

//     // Asynchronously apply all validation rules to the query fields
//     await Promise.all(validationRules.map(validationRule => validationRule.run(req)));

//     // Get the validation results for the query
//     return validationResult(req);
// };

//////////
//CLASS
class ValidateBody{
    // Validation rules array
    validationRules = [];

    //////////
    //VALIDATION METHODS

    // Text validator
    textValidator(text, require, min, max, traduction){
        //Create rule
        const validationRule = check(text);

        //Add basic rules for text
        validationRule.isString().withMessage(`${traduction} doit être une chaîne de caractères`).isLength({ min: min, max: max }).withMessage(`${traduction} doit avoir entre ${min} et ${max} caractères`).matches(/^[a-zA-Z\s]+$/).withMessage(`${traduction} ne doit contenir que des lettres et des espaces`);

        //Add conditionnal rules (require or not)
        if (require) {
            validationRule.notEmpty().withMessage(`Le ${traduction} est obligatoire`);
        }else{
            validationRule.optional();
        }

        //Push rules in rules array
        this.addValidationRule(validationRule);    
    }

    emailValidator(email, require, alreadyExist, existUser){

        //Create rule
        const validationRule = check(email);

        // Add basic rules for email
        validationRule.isEmail().withMessage('L\'adresse e-mail est invalide').normalizeEmail()
       
        // Add conditionnal rules if email is required
        if (require) {
            validationRule.notEmpty().withMessage('L\'adresse e-mail est obligatoire');
        }

        // Add conditionnal rules if one user already have this email adress
        if (alreadyExist) {
            validationRule.custom(async (value) => {
                // Check if the email already exists in the database
                const user = await User.findOne({ email: value });
                if (user) {
                    throw new Error('L\'adresse e-mail est déjà utilisée.');
                }
                return true;
            });
        }

        // Add conditionnal rules if one user have this email
        if (existUser) {
            validationRule.custom(async (value) => {
                // Check if user exist with the given email
                const user = await User.findOne({ email: value });
                if (!user) {
                    throw new Error('Cet utilisateur n\'existe pas');
                }
                return true;
            })
        }

        // Push rules in rules array
        this.addValidationRule(validationRule);  
    }

    passwordValidator(password){
        // Create rule
        const validationRule = check(password);

        // Add basic rules for password
        validationRule.isLength({ min: 6, max: 20 }).withMessage('Le mot de passe doit avoir entre 6 et 20 caractères').matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/).withMessage('Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial');

        // Push rules in rules array
        this.addValidationRule(validationRule); 
    }

    roleValidator(role, require){
        const validationRule = check(role);

        // Add basic rules for role
        validationRule.isIn(['user', 'health', 'blog']).withMessage('Le rôle doit être "user", "health" ou "blog"');

        // Add conditionnal rules (require or not)
        if (require) {
            validationRule.notEmpty().withMessage('Le rôle est obligatoire');
        }

        // Push rules in rules array
        this.addValidationRule(validationRule);
    }

    birthdateValidator(birthdate, require){
        // Create rule
        const validationRule = check(birthdate);

        // Add basic rules for birthdate
        validationRule.isISO8601().toDate().withMessage('La date de naissance est au mauvais format');

        if (require) {
            validationRule.notEmpty().withMessage('La date de naissance est obligatoire');
        }

        // Push rules in rules array
        this.addValidationRule(validationRule);
    }

    phoneValidator(phone, require){
        // Create rule
        const validationRule = check(phone);

        // Add basic rules for phone
        validationRule.optional().isMobilePhone('any', {strictMode : false}).withMessage('Le numéro de téléphone doit être valide');

        // Push rules in rules array
        this.addValidationRule(validationRule);
    }
    
    secretPinValidator(secret_pin, require, lenght){
        // Create rule
        const validationRule = check(secret_pin);

        // Add basic rules for secret_pin
        validationRule.isNumeric().withMessage('Le code secret doit être un nombre').isLength({ min: lenght, max: lenght }).withMessage('Le code secret doit avoir exactement 6 chiffres');

        // Add conditionnal rules (require or not)
        if (require) {
            validationRule.notEmpty().withMessage('Le code secret est obligatoire');
        }

        // Push rules in rules array
        this.addValidationRule(validationRule);
    }

    //////////
    //////////

    //////////
    //PUSH RULES

    // Push new rules in validation rules array
    addValidationRule(rule) {
        this.validationRules.push(rule);
    }

    //////////
    //////////

    //////////
    //VALIDATE RULES

    validateRules = async ( req, res, notFoundMessage = "") => {

        // Asynchronously apply all validation rules to the query fields
        await Promise.all(this.validationRules.map(validationRule => validationRule.run(req)));
    
        // Get the validation results for the query
        return validationResult(req);
    };

    //////////
    //////////
}

//////////
//////////

module.exports = ValidateBody;
