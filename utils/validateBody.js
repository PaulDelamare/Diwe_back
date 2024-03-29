//////////
//REQUIRE
const { validationResult, check } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { isValidObjectId } = require('mongoose');
const path = require('path');
//////////
//////////

//////////
//CLASS
class ValidateBody{
    
    // Validation rules array
    _validationRules = [];

    //////////
    //VALIDATION METHODS

    // Text validator
    
/**
+     * Validates the input text based on the provided rules.
+     *
+     * @param {string} text - the key in body
+     * @param {boolean} require - required in body
+     * @param {number} min - the minimum length of the text
+     * @param {number} max - the maximum length of the text
+     * @param {string} traduction - the translation of the text for error messages
+     * @param {boolean} punctuation - if the text can have punctuation or not
+     * @return {void} 
+     */
    textValidator(text, require, min, max, traduction, punctuation = false) {
        //Create rule
        const validationRule = check(text);

        let regex = /^[a-zA-ZÀ-ÿ\s]+$/;
        if (punctuation) {
            regex = /^[a-zA-ZÀ-ÿ\s.,;!?'+-]+$/;
        }

        //Add basic rules for text (Must be a regulated size string with only letters)
        validationRule.isString().withMessage(`${traduction} doit être une chaîne de caractères`).isLength({ min: min, max: max }).withMessage(`${traduction} doit avoir entre ${min} et ${max} caractères`);

        //Add conditionnal rules (require or not)
        if (require || punctuation) {
            validationRule.notEmpty().withMessage(`Le ${traduction} est obligatoire`).matches(regex).withMessage(`${traduction} ne doit contenir que des lettres, des espaces et de la ponctuation`);
        }else{
            validationRule.optional();
        }

        //Push rules in rules array
        this._addValidationRule(validationRule);    
    }

    
/**
+     * Validate email based on given conditions.
+     *
+     * @param {string} email - the key in body
+     * @param {boolean} require - whether the email is required
+     * @param {boolean} alreadyExist - whether the email must not exist in the database
+     * @param {boolean} existUser - whether the email must exist in the database
+     * @return {void}
+     */
    async emailValidator(email, require, alreadyExist, existUser){

        //Create rule
        const validationRule = check(email);

        // Add basic rules for email (must be an email)
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
                    if (user.active === false) {
                        throw new Error('Ce compte est en attente de validation');
                    }else{
                        throw new Error('Cet email est déjà utilisé');
                    }
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
                        throw new Error('Informations d\'identification invalides');
                }
                return true;
            });
        }

        // Push rules in rules array
        this._addValidationRule(validationRule);
    }

 /**
+     * Validates the given password according to the defined rules.
+     *
+     * @param {string} password - the key in body
+     * @return {void}
+     */
    passwordValidator(password){
        // Create rule
        const validationRule = check(password);

        // Add basic rules for password (Must have a regulated size and have an uppercase letter, a number and a special character)
        validationRule.isLength({ min: 6, max: 20 }).withMessage('Le mot de passe doit avoir entre 6 et 20 caractères').matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/).withMessage('Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial');

        // Push rules in rules array
        this._addValidationRule(validationRule); 
    }

/**
+     * Role validator function.
+     *
+     * @param {string} role - the key in body
+     * @param {boolean} require - description of parameter
+     * @return {void}
+     */
    roleValidator(role, require){
        const validationRule = check(role);

        // Add basic rules for role (Must be "user", "health" or "blog")
        validationRule.isIn(['user', 'health', 'blog']).withMessage('Le rôle doit être "user", "health" ou "blog"');

        // Add conditionnal rules (require or not)
        if (require) {
            validationRule.notEmpty().withMessage('Le rôle est obligatoire');
        }

        // Push rules in rules array
        this._addValidationRule(validationRule);
    }

/**
+     * Validate a birthdate.
+     *
+     * @param {string} birthdate - the key in body
+     * @param {boolean} require - is require in body or not
+     * @return {void}
+     */
    birthdateValidator(birthdate, require){
        // Create rule
        const validationRule = check(birthdate);

        // Add basic rules for birthdate (Must be an ISO8601 date)  
        validationRule.isISO8601().toDate().withMessage('La date de naissance est au mauvais format');

        if (require) {
            validationRule.notEmpty().withMessage('La date de naissance est obligatoire');
        }

        // Push rules in rules array
        this._addValidationRule(validationRule);
    }

/**
+     * Validate a phone number and add validation rule.
+     *
+     * @param {string} phone - the key in body
+     * @param {boolean} require - is require in body or not (base = false)
+     * @return {void}
+     */
    phoneValidator(phone, require = false){
        // Create rule
        const validationRule = check(phone);

        // Add basic rules for phone (Must be a mobile phone)
        validationRule.isMobilePhone('any', {strictMode : false}).withMessage('Le numéro de téléphone doit être valide');
        if (require) {
            validationRule.notEmpty().withMessage('Le numéro de numéro est obligatoire');
        }else{
            validationRule.optional();
        }

        // Push rules in rules array
        this._addValidationRule(validationRule);
    }
    
/**
+     * Validate a secret pin.
+     *
+     * @param {string} secret_pin - the key in body
+     * @param {boolean} require - is require in body or not
+     * @param {number} length - length of secret pin
+     * @return {void}
+     */
    secretPinValidator(secret_pin, require, length){
        // Create rule
        const validationRule = check(secret_pin);

        // Add basic rules for secret_pin (must be a number with a regulated size)
        validationRule.isNumeric().withMessage('Le code secret doit être un nombre').isLength({ min: length, max: length }).withMessage('Le code secret doit avoir exactement 6 chiffres');

        // Add conditionnal rules (require or not)
        if (require) {
            validationRule.notEmpty().withMessage('Le code secret est obligatoire');
        }

        // Push rules in rules array
        this._addValidationRule(validationRule);
    }

/**
+     * Check the user password with password in body.
+     *
+     * @param {string} password - the key in body
+     * @param {User} user - user for comparison
+     * @return {void}
+     */
    checkPassword(password, user){
        // Create rule
        const validationRule = check(password);

        // Password must be the same as user
        validationRule.custom(async (value) => {
            // Compare password
            const passwordMatching = await bcrypt.compare(value, user.password);
            if (!passwordMatching) {
                throw new Error('Informations d\'identification invalides');
            }
            // Password are the same
            return true;
        });

        // Push rules in rules array
        this._addValidationRule(validationRule);
    }

     /**
     * Validate an image file.
     *
     * @param {string} image - the key in body
     * @param {boolean} require - whether the image is required
     * @return {void}
     */
    imageValidator(image, require = false) {
        // Create rule
        const validationRule = check(image);

        // Add basic rules for image (must be an image file)
        validationRule.custom(async (value, { req }) => {
            if (!req.file) {
                // If image is not required and not present, consider it validated
                if (require) {
                    throw new Error('L\'image est obligatoire');
                }
                return true; 
            }
            // Check file type with file-type
            const { fileTypeFromBuffer } = await import('file-type');
            const fileType = await fileTypeFromBuffer(req.file.buffer);
            // Add more mime types as needed
            const allowedMimeTypes = ['image/jpeg', 'image/png'];
            if (!allowedMimeTypes.includes(fileType.mime)) {
                throw new Error('Le fichier doit être une image de type JPEG, PNG ou JPG');
            }

            // Check file extension
            const allowedExtensions = ['jpg', 'jpeg', 'png'];
            const fileExtension = path.extname(req.file.originalname).slice(1).toLowerCase();
            if (!allowedExtensions.includes(fileExtension)) {
                throw new Error('L\'extension du fichier n\'est pas autorisée');
            }

            // If is valid, return true
            return true;
        });

        // Push rules in rules array
        this._addValidationRule(validationRule);
    }

    /**
     * A function to validate the link code.
     *
     * @param {string} link_code - name in body
     * @param {boolean} [require=false] - Flag indicating if the link code is required
     * @return {void} 
     */
    linkCodeValidator(link_code, require = false) {
        // Create rule
        const validationRule = check(link_code);

        // Link code must be a number
        validationRule.isNumeric().withMessage('Le code de liaison doit être un nombre').isLength({ min: 10, max: 10 }).withMessage('Le code de liaison doit avoir exactement 10 chiffres');

         // Add conditionnal rules (require or not)
         if (require) {
            validationRule.notEmpty().withMessage('Le code de liaison est obligatoire');
        }

         // Push rules in rules array
        this._addValidationRule(validationRule);

    }

    /**
     * A function to validate boolean fields.
     *
     * @param {string} boolean_fields - name in body
     */
    booleanFieldsValidator(boolean_fields) {
        // Create rule
        const validationRule = check(boolean_fields).isBoolean().withMessage('Le champ doit être un booleen');

        // Push rules in rules array
        this._addValidationRule(validationRule);
    }

    /**
     * Validates a number based on the specified rules.
     *
     * @param {string} number - name in body
     * @param {boolean} require - whether the number is required
     * @param {number} min - the minimum value allowed for the number
     * @param {number} max - the maximum value allowed for the number
     */
    numberValidator(number, require = false, min = false, max = false) {
        // Create rule
        const validationRule = check(number);

        //Basic validation
        validationRule.isNumeric().withMessage('Le champ doit être un nombre');

         // Add conditionnal rules (require or not)
        if (require) {
            validationRule.notEmpty().withMessage('Le champ est obligatoire');
        }

        if (min) {
            // Check if the number is superior to min
            validationRule.custom((value) => {
                if (value < min) {
                    throw new Error(`Le nombre doit être supérieur à ${min}` );
                }
                // Value is superior to min
                return true;
            });
        }
        if (max) {
            // Check if the number is inferior to max
            validationRule.custom((value) => {
                if (value > max) {
                    throw new Error(`Le nombre doit être inférieur à ${max}` );
                }
                // Value is inferior to max
                return true;
            });
        }

         // Push rules in rules array
        this._addValidationRule(validationRule);
    }

    /**
     * Validate the given object id.
     *
     * @param {string} objectId - name in body
     * @param {boolean} require - require or not
     * @return {void}
     */
    validateObjectId(objectId, require = false) {
        // Create rule
        const validationRule = check(objectId);

        //Validation rule
        validationRule.custom((value) => {
            if (!isValidObjectId(value)) {
                throw new Error('L\'id est invalide');
            }
            // Value is superior to min
            return true;
        });

        // Add conditionnal rules (require or not)
        if (require) {
            validationRule.notEmpty().withMessage('L\'id est obligatoire');
        }

        // Push rules in rules array
        this._addValidationRule(validationRule);
    }

    /**
     * Validate a PDF files.
     *
     * @param {string} pdf - the key in body
     * @param {boolean} require - whether the PDF is required
     * @return {void}
     */
    pdfValidator(pdfs, require = false) {
        // Create rule
        const validationRule = check(pdfs);
      
        // Add basic rules for PDF (must be a PDF file)
        validationRule.custom(async (value, { req }) => {
            
            // Create array for push files in
            let files = req.files ?? [req.file];

            // If there are no file
            if (files.length === 0) {
                // If PDF is not required and not present, consider it validated
                if (require) {
                    throw new Error('Au moins un fichier PDF est obligatoire');
                }
                return true;
            }
      
            // Check each file in the array
            for (const file of files) {
                // Check file type using file-type library
                const { fileTypeFromBuffer } = await import('file-type');
                const fileType = await fileTypeFromBuffer(file.buffer);
                // Check in binary the document and throw error if isn't a PDF
                if (fileType === undefined || fileType.ext !== 'pdf') {
                    throw new Error('Tous les fichiers doivent être des documents PDF');
                }
        
                // Check file extension
                const allowedExtensions = ['pdf'];
                const fileExtension = path.extname(file.originalname).slice(1).toLowerCase();
                // If extension is not allowed
                if (!allowedExtensions.includes(fileExtension)) {
                    throw new Error('L\'extension du fichier n\'est pas autorisée');
                }
            }
            // If all files are correct, consider them validated
            return true;
        });
      
        // Push rules in rules array
        this._addValidationRule(validationRule);
    }

    /**
    + * Validates the order status based on the provided role and requirement.
    + *
    + * @param {string} status - The status of the order status. Must be "pending", "in progress", or "done".
    + * @param {boolean} require - Indicates whether the status is required or not.
    + * @return {void} This function does not return a value.
    + */
    orderStatusValidator(status, require){
        const validationRule = check(status);

        // Add basic rules for status (Must be "user", "health" or "blog")
        validationRule.isIn(['pending', 'in progress', 'done']).withMessage('Le status doit être "pending", "in progress" ou "done"');

        // Add conditionnal rules (require or not)
        if (require) {
            validationRule.notEmpty().withMessage('Le rôle est obligatoire');
        }

        // Push rules in rules array
        this._addValidationRule(validationRule);
    }
      
    //////////
    //////////

    //////////
    //PUSH RULES

/**
+     * Push new rules in validation rules array.
+     *
+     * @param {ValidationChain} rule - new rule
+     * @return {void}
+     */
    // Push new rules in validation rules array
    _addValidationRule(rule) {
        this._validationRules.push(rule);
    }

    //////////
    //////////

    //////////
    //VALIDATE RULES

/**
+     * Asynchronously apply all validation rules to the query fields
+     *
+     * @param {any} req - req
+     * @return {Result<ValidationError>} - return the validation results
+     */
    async validateRules(req){

        // Asynchronously apply all validation rules to the query fields
        await Promise.all(this._validationRules.map(validationRule => validationRule.run(req)));
    
        // Get the validation results for the query
        return validationResult(req);
    };

    //////////
    //////////
}

//////////
//////////

module.exports = ValidateBody;
