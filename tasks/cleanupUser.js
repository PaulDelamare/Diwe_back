const cron = require('node-cron');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

/**
+ * Cleanup old inactive user accounts by deleting users created two weeks ago and not active.
+ *
+ * @param {None} None
+ * @return {None} None
+ */
function cleanupTask() {
    // Task is execute every day at midnight
    cron.schedule('0 0 * * *', async () => {
        try {
            // Defined the date two weeks ago
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

            // Find users created two weeks ago and not active
            const users = await User.find({ created_at: { $lt: twoWeeksAgo }, active: false });

            // Delete associated doctors and users
            for (const user of users) {
                // If user have health role
                if(user.role === 'health'){

                    // Find doctor associated with the user
                    const doctor = await Doctor.findOne({ id_user: user._id });
    
                    // Check if doctor really exist
                    if (doctor && doctor.users_link.length === 0 ) {
                        // If a doctor is found, delete it
                        await Doctor.deleteOne({ _id: doctor._id });
                    }
                }
                
                // Delete the user
                await User.deleteOne({ _id: user._id });
            }

            console.log('Les utilisateurs créer depuis plus de deux semaine qui n\'ont pas activé leur compte sont supprimés.');
        } catch (error) {
            console.error('Erreur lors de l\'exécution de la suppression des utilisateurs qui n\'ont pas activé leur compte', error);
        }
    });
}

module.exports = cleanupTask