const cron = require('node-cron');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

/**
+ * Deletes users who have requested deletion more than 30 days ago.
+ *
+ * @param {none} 
+ * @return {none} 
+ */
function deleteUser() {
    // Task execuste at 00h05 hour
    cron.schedule('5 0 * * *', async () => {
        try {
            // Define date > 30 days ago
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // FInd user to update 
            const usersToUpdate = await User.find({ 
                request_deletion: { $ne: null, $lt: thirtyDaysAgo }, 
            });

            // Find user who have in request_deletion fiels, the date > 30 days ago and update them
            const userUpdateResult = await Promise.all(usersToUpdate.map(async (user) => {
                //Create unique email
                const uniqueEmail = `deleted-${user.created_at.getTime()}@diwe.del`;

                //Change personnal information to null
                const updateResult = await User.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            firstname: null,
                            lastname: null,
                            email: uniqueEmail,
                            phone: null,
                            password: null,
                            birthday: null,
                            secret_pin: null,
                            request_deletion: null
                        }
                    }
                );
                return updateResult;
            }));

            // Remove id_user if there is one doctor accoubt to delete
            await Doctor.updateMany(
                { id_user: { $in: usersToUpdate.map(user => user._id) } },
                { $set: { id_user: null } }
            );

            console.log(`${usersToUpdate.length} utilisateur(s) dont la demande de suppression date de plus de 30 jours ont été mis à jour.`);
        } catch (error) {
            console.error('Erreur lors de l\'exécution de la mise à jour des utilisateurs dont la demande de suppression date de plus de 30 jours :', error);
        }
    });
}

module.exports = deleteUser