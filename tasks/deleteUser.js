const cron = require('node-cron');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const RequestLink = require('../models/RequestLink');
const Meal = require('../models/Meal');
const url = require('url');
const path = require('path');
const fs = require('fs').promises;

/**
+ * Deletes users who have requested deletion more than 30 days ago.
+ *
+ * @param {none} 
+ * @return {none} 
+ */
function deleteUser() {
    // Task execuste at 00h05 hour
    cron.schedule('05 0 * * *', async () => {
        try {
            // Define date > 30 days ago
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // FInd user to update 
            const usersToUpdate = await User.find({ 
                request_deletion: { $ne: null, $lt: thirtyDaysAgo }, 
            });

            // Find doctors linked to the users to update
            const doctorsToUpdate = await Doctor.find({
                users_link: { $in: usersToUpdate.map(user => user._id) },
            });

            // Remove user id from doctors users_link array
            await Promise.all(doctorsToUpdate.map(async (doctor) => {
                const updatedUsersLink = doctor.users_link.filter(userId => !usersToUpdate.map(user => user._id.toString()).includes(userId.toString()));
                await Doctor.updateOne({ _id: doctor._id }, { $set: { users_link: updatedUsersLink } });
            }));

            // Find user who have in request_deletion fiels, the date > 30 days ago and update them
            await Promise.all(usersToUpdate.map(async (user) => {

                if (user.profile_picture) {
                    try {
                        // Parse the URL to extract the file path
                        const parsedUrl = url.parse(user.profile_picture);
                        const filePath = path.join(__dirname, '..', parsedUrl.pathname);

                        console.log("parsedUrl", parsedUrl)
                        console.log("filePath", filePath)
                
                        // Delete the file from the file system
                        await fs.unlink(filePath);
                        console.log(`Profile picture of user ${user._id} deleted.`);
                    } catch (error) {
                        console.error(`Error deleting profile picture of user ${user._id}:`, error);
                    }
                }

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
                            request_deletion: null,
                            doctors_link: [],
                            profile_picture: null,
                            token: null,
                        }
                    }
                );
                return updateResult;
            }));

            // Remove id_user if there is one doctor account to delete
            await Doctor.updateMany(
                { id_user: { $in: usersToUpdate.map(user => user._id) } },
                { $set: { id_user: null } }
            );

            await RequestLink.deleteMany({ id_user: { $in: usersToUpdate.map(user => user._id) } });
            await Meal.deleteMany({ id_user: { $in: usersToUpdate.map(user => user._id) } });

            console.log(`${usersToUpdate.length} utilisateur(s) dont la demande de suppression date de plus de 30 jours ont été mis à jour.`);
        } catch (error) {
            console.error('Erreur lors de l\'exécution de la mise à jour des utilisateurs dont la demande de suppression date de plus de 30 jours :', error);
        }
    });
}

module.exports = deleteUser