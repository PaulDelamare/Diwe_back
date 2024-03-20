//////////
//REQUIRE
const Doctor = require("../models/Doctor");
const RequestLink = require("../models/RequestLink");
const User = require("../models/User");
//////////
//////////

//////////
//FUNCTION

/**
+ * Delete a link between a doctor and a user, updating both their profiles.
+ *
+ * @param {string} id_doctor - The ID of the doctor
+ * @param {string} id_user - The ID of the user
+ * @param {object} res - The response object
+ * @return {object} The response object with status and a message indicating the result of the deletion
+ */
const deleteLinkFunction =  (id_doctor) =>  (id_user) =>async (res)=> {
    // Finc doctor by id
    const doctor = await Doctor.findById( id_doctor );
    // If the doctor does not exist, return an error
    if (!doctor) {
        return res.status(404).json({ message: "Doctor non trouvé", status : 404 });
    }
    //Find user by id
    const user = await User.findById(id_user);
    // If the user does not exist, return an error
    if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé", status : 404 });
    }
    // If the doctor haven't linked any user, return an error
    if (!doctor.users_link.includes(id_user)) {
        return res.status(400).json({ message: "Identifiant non valide Doctor", status : 400 });
    }
    // If the user haven't linked any doctor, return an error
    if (!user.doctors_link.includes(id_doctor)) {
        return res.status(400).json({ message: "Identifiant non valide User", status : 400 });
    }
    // If all is valide
    // Delete doctor and user link
    await Doctor.findOneAndUpdate(
        { _id: doctor._id },
        { $pull: { users_link: user._id } },
        { new: true }
    );
    await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { doctors_link: doctor._id } },
        { new: true }
    );

    // Delete the requets in table
    await RequestLink.findOneAndDelete({ id_doctor: doctor._id, id_user: user._id });
    
    // return succes
    return res.status(200).json({ message: "Lien supprimé", status : 200 });
}
//////////
//////////

module.exports = deleteLinkFunction