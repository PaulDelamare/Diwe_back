const cron = require('node-cron');
const User = require('../models/User');

function cleanupTask() {
    // Task is execute every day at midnight
    cron.schedule('0 0 * * *', async () => {
        try {
            // Defined the date two weeks ago
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

            // Find users created two weeks ago and not active and delete them
            await User.deleteMany({ created_at: { $lt: twoWeeksAgo }, active: false });

            console.log('Les utilisateurs créer depuis plus de deux semaine qui n\'ont pas activé leur compte sont supprimés.');
        } catch (error) {
            console.error('Erreur lors de l\'exécution de la suppression des utilisateurs qui n\'ont pas activé leur compte', error);
        }
    });
}

module.exports = cleanupTask