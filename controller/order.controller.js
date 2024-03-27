//////////
//REQUIRE
//Import popup model
const Product = require('../models/Product');
//Import validateBody class for have an acces to validate rules
const ValidateBody = require('../utils/validateBody');
const Order = require('../models/Order');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
//////////
//////////

//////////
//FUNCTION CONTROLLER

//CREATE Product
/**
+ * Create a new product
+ *
+ * @param {Object} req - the request object
+ * @param {Object} res - the response object
+ * @return {Object} JSON response with success or error message
+ */
exports.create = async (req, res) => {
    const user = await User.findById(req.user._id);
    if(!user) {
        return res.status(404).json({ error: 'utilisateur non trouvé', status : 404 });
    }

    //Validation
    //Instance validateBody
    const validateBody = new ValidateBody();

    //Validation
    validateBody.validateObjectId('id_product', true);
    validateBody.emailValidator('email_doctor', true, false, true);

    //Validate rules
    const valideBody = await validateBody.validateRules(req);

    //If one rule is'nt valid, return error
    if (!valideBody.isEmpty()) {
        // If errors are present, return a JSON response with code 422 Unprocessable Entity
        return res.status(422).json({ errors: valideBody.array(), status : 422 });
    }

    // Get id_product
    const id_product = req.body.id_product;

    // Get product
    const product = await Product.findById(id_product);
    // If product is not found
    if(!product) {
        return res.status(404).json({ error: 'Le produit sélectionné n\'est pas valide', status : 404 });
    }

    const doctor = await Doctor.findOne({email: req.body.email_doctor});
    if(!doctor) {
        return res.status(404).json({ error: 'Le medecin sélectionné n\'est pas valide', status : 404 });
    }

    if (!user.doctors_link.includes(doctor._id)) {
        return res.status(409).json({ error: 'Vous n\'êtes pas lié à ce médecin', status : 409 });
    }

    try {
        // Add order in data base
        const order = await Order.create({
            id_product,
            email_doctor: req.body.email_doctor,
            id_user: user._id,
            product_name: product.name,
        });

        //If product is create return success
        res.status(201).json({ 
            message: "Le produit a été correctement enregistré",
            status : 201
         });

    } catch (error) {
        //If an error occurs, send an error message
        res.status(500).json({
            error: error.message || "Une erreur s'est produite lors de la commande.",
            status : 500
        });
    }
}

//////////
//////////