//////////
//REQUIRE
//Import popup model
const Product = require('../models/Product');
//Import validateBody class for have an acces to validate rules
const ValidateBody = require('../utils/validateBody');
// Import Order model
const Order = require('../models/Order');
// Import User model
const User = require('../models/User');
// Import Doctor model
const Doctor = require('../models/Doctor');
// Import function for create pdf
const { createAndUploadPdf } = require('../utils/createPdf');
// Import send email function
const sendEmail = require('../utils/sendEmail');
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
    // Check the user validation
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
    if(!product) {
        // If product is not found return error
        return res.status(404).json({ error: 'Le produit sélectionné n\'est pas valide', status : 404 });
    }

    // get the doctor with email
    const doctor = await Doctor.findOne({email: req.body.email_doctor});
    if(!doctor) {
        // If doctor is not found return error
        return res.status(404).json({ error: 'Le medecin sélectionné n\'est pas valide', status : 404 });
    }

    // Check if user is linked to doctor
    if (!user.doctors_link.includes(doctor._id)) {
        // If user is not linked to doctor
        return res.status(409).json({ error: 'Vous n\'êtes pas lié à ce médecin', status : 409 });
    }

    try {
        // Add order in data base
        const order = await Order.create({
            id_product,
            id_doctor: doctor._id,
            id_user: user._id,
            product_name: product.name,
        });

        // Create the pdf for order
        const pdf = await createAndUploadPdf(order, product, user);

        // Add pcustom data to teplate
        const emailData = {
            email: user.email,
            firstname: doctor.firstname,
            user: user.firstname,
            emailService: process.env.EMAIL_SERVICE
        }

        // Create attachment for the mail
        const attachments = [
            {
                filename: pdf.originalname,
                content: pdf.buffer,
                encoding: 'base64',
                encryptedPath: pdf.encryptedPath,
            }
        ]

        // Send email
        await sendEmail(doctor.email, user.email,'Commande', 'order/request-order', emailData, attachments);

        //If product is create return success
        res.status(201).json({ 
            message: 'Le produit a été correctement enregistré',
            status : 201
        });

    } catch (error) {
        //If an error occurs, send an error message
        res.status(500).json({
            error: error.message || 'Une erreur s\'est produite lors de la commande.',
            status : 500
        });
    }
}

/**
+ * Retrieves all orders for a user.
+ *
+ * @param {Object} req - The request object.
+ * @param {Object} res - The response object.
+ * @return {Promise<void>} The function returns a Promise that resolves to undefined.
+ */
exports.getAllOrders = async (req, res) => {
    // Check the user validation
    const user = await User.findById(req.user._id);
    if(!user) {
        // If user is not found
        return res.status(404).json({ error: 'utilisateur non trouvé', status : 404 });
    }

    let doctor;
    if(user.role === "health"){
        doctor = await Doctor.findOne({id_user: user._id});
        if(!doctor) {
            // If doctor is not found
            return res.status(404).json({ error: 'Le professionnel n\'est pas valide', status : 404 });
        }
    }
    try {

        let orders;
        if (user.role === "health") {
        orders = await Order.find({ id_doctor: doctor._id }).populate({
            path: 'id_user',
            select: 'firstname email',
        }).populate({
            path: 'id_doctor',
            select: 'firstname email',
        }).populate({
            path: 'id_product',
            select: 'name image_path',
        });
        } else {
        orders = await Order.find({ id_user: user._id }).populate({
            path: 'id_user',
            select: 'firstname email',
        }).populate({
            path: 'id_doctor',
            select: 'firstname email',
        }).populate({
            path: 'id_product',
            select: 'firstname image_path',
        });
        }
        // return this
        res.status(200).json({orders: orders, status : 200});
    } catch (error) {
        // If an error occurs  send an error message
        res.status(500).json({
            error: error.message || 'Une erreur s\'est produite lors de la commande.',
            status : 500
        });
    }
}

/**
+ * A function to change the status of a user's order.
+ *
+ * @param {Object} req - the request object
+ * @param {Object} res - the response object
+ * @return {Object} JSON response with status code and message
+ */
exports.changeStatus = async (req, res) => {
    const user = await User.findById(req.user._id);
    if(!user) {
        // If user is not found
        return res.status(404).json({ error: 'utilisateur non trouvé', status : 404 });
    }

    //Validation
    const validateBody = new ValidateBody();

    //Check if image is correct
    validateBody.validateObjectId('id_order', true);
    //Check if name is correct
    validateBody.orderStatusValidator('status', true);

    //Check the rules with data in body
    let valideBody = await validateBody.validateRules(req);

    // Check for validation errors
    if (!valideBody.isEmpty()) {
        // Return a JSON response with the determined status code
        return res.status(422).json({ errors: valideBody.array(), status: 422 });
    }

    // Get the order from database
    const order = await Order.findById(req.body.id_order);
    // If the order doesn't exist
    if(!order){
        // Return a JSON response with the determined status code
        return res.status(404).json({ error: 'La commande n\'a pas été trouvé', status : 404 });
    }

    // Get doctor
    const doctor = await Doctor.findOne({id_user: user._id});
    // If doctor is not found
    if(!doctor) {
        // If doctor is not found
        return res.status(404).json({ error: 'Le professionnel n\'est pas valide', status : 404 });
    }

    // Check if the doctor is the same
    if(order.id_doctor.toString() !== doctor._id.toString()){
        // If doctor is not found
        return res.status(401).json({ error: 'Le professionnel n\'est pas valide', status : 401 });
    }

    try {
        // Update the order status
        await Order.updateOne({ _id: req.body.id_order }, { status: req.body.status });

        // return success
        res.status(200).json({message: 'Le statut de la commande a été correctement enregisté', status : 200});
    } catch (error) {
        // If an error occurs  send an error message
        res.status(500).json({
            error: error.message || 'Une erreur s\'est produite lors de la commande.',
            status : 500
        });
    }
}

//////////
//////////