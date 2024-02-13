//////////
//REQUIRE

//Import user model
const User = require('../models/User');
//Import popup model
const DailyPopup = require('../models/Popup');

//////////
//////////

//////////
//FUNCTION CONTROLLER

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

//////////
//////////