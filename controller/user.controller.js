//////////
//REQUIRE

//Import user model
const User = require('../models/User');
//Import popup model
const DailyPopup = require('../models/Popup');
const ValidateBody = require('../utils/validateBody');
//Require fs (file system)
const fs = require('fs');
//Require path
const path = require('path');

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
        await User.findByIdAndUpdate(user._id, { profile_picture: imageFilePath });
        
        //Return message if success
        return res.status(200).json({ message: 'La photo de profil a correctement été enregistré', status: 200 });

    }catch(e){
        console.error('Error in updateProfilePicture:', e);
        return res.status(500).json({ error: 'Une erreur s\'est produite lors de la mise à jour de la photo de profil.', status : 500 });
    }
}

//////////
//////////