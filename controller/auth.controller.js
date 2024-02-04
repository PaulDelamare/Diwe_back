const User = require('../models/User');
const { validationResult, check } = require('express-validator');

exports.create = async (req, res) => {
    const validationRules = [
        //Email is required and must be an unique email
        check('email').notEmpty().withMessage('L\'adresse e-mail est obligatoire').isEmail().withMessage('L\'adresse e-mail est invalide').normalizeEmail().custom(async (value) => {
            // Check if the email already exists in the database
            const user = await User.findOne({ email: value });
            if (user) {
                throw new Error('L\'adresse e-mail est déjà utilisée.');
            }
            return true;
        }),

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

    await Promise.all(validationRules.map(validationRule => validationRule.run(req)));
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        await User.create(req.body, res);
        res.status(201).json({ 
            message: 'Utilisateur creé avec succes'
         });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Une erreur s'est produite lors de la création de l'utilisateur."
        });
    }
}