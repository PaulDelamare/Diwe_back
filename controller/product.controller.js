//////////
//REQUIRE
//Import popup model
const Product = require('../models/Product');
const uploadImage = require('../utils/uploadImage');
//Import validateBody class for have an acces to validate rules
const ValidateBody = require('../utils/validateBody');
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

    //Validation
    //Instance validateBody
    const validateBody = new ValidateBody();

    //Validation
    validateBody.imageValidator('image', true);
    validateBody.textValidator('name', true, 3, 255, 'Le nom', true);
    validateBody.textValidator('content', true, 3, 255, 'La description', true);
    validateBody.numberValidator('price', true);

    //Validate rules
    const valideBody = await validateBody.validateRules(req);

    //If one rule is'nt valid, return error
    if (!valideBody.isEmpty()) {
        // If errors are present, return a JSON response with code 422 Unprocessable Entity
        return res.status(422).json({ errors: valideBody.array(), status : 422 });
    }
    try {

        //Upload image
        req.body.image_path = uploadImage(req.file)('uploads/public/product/');

        //Create product
        await Product.create(req.body);

        //If product is create return success
        res.status(201).json({ 
            message: "Le produit a été correctement enregistré",
            status : 201
         });

    } catch (error) {
        //If an error occurs, send an error message
        res.status(500).json({
            error: error.message || "Une erreur s'est produite lors de la création du produit.",
            status : 500
        });
    }
}

/**
+ * Function to retrieve all products.
+ *
+ * @param {Object} req - the request object
+ * @param {Object} res - the response object
+ * @return {Promise} - a promise that resolves with the products or rejects with an error
+ */
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({products: products, status: 200});
    } catch (error) {
        res.status(500).json({ error: error.message || "Une erreur s'est produite lors de la création du produit.", status : 500 });
    }
}

//////////
//////////