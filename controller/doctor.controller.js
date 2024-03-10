//////////
//REQUIRE
//Import User model
const User = require('../models/User');
//Import Doctor model
const Doctor = require('../models/Doctor');
//Import validateBody class for have an acces to validate rules
const ValidateBody = require('../utils/validateBody');
//Import Request link model
const RequestLink = require('../models/RequestLink');
//////////
//////////

//////////
//FUNCTION CONTROLLER

//CREATE POPUP
/**
+ *
+ * @param {Object} req - the request object
+ * @param {Object} res - the response object
+ * @return {Object} JSON response with success or error message
+ */
exports.getRequestLink = async (req, res) => {
    //Find user last information with the id user in req (jwt)
    const user = await User.findById(req.user._id);

    // If the user does not exist, return an error
    if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé.', status : 404 });
    }

    //Get doctor information
    const doctor = await Doctor.findOne({ id_user: user._id });

    // If the user does not exist, return an error
    if (!doctor) {
        return res.status(404).json({ error: 'Professionel non trouvé.', status : 404 });
    }
    try {
        const requestsWithUsers = await RequestLink.aggregate([
            {
                // FInd all requests for user
                $match: { id_doctor: doctor._id }
            },
            {
                // Find user linked to the id_doctor
                $lookup: {
                    from: 'user',
                    localField: 'id_user',
                    foreignField: '_id',
                    as: 'users',
                    // Find only user data that we need
                    pipeline: [
                        {
                          $project: {
                            _id: 0,
                            lastname: 1,
                            firstname: 1,
                            email: 1,
                            phone: 1
                          }
                        }
                      ]
                }
            },
            {
                // Select data that we need in the result
                $project: {
                    _id: 0,
                    status: 1,
                    created_at: 1,
                    users:1
                }
            }
        ]);

        //Return requests 
        return res.status(200).json({ requests:requestsWithUsers, status : 200 });
    } catch (error) {
        //If an errir occur, return this error
        return res.status(500).json({ error: error, status : 500 });
    }
}

//////////
//////////