//////////
//REQUIRE

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

//Require route
const AuthRoute = require('./routes/auth.routes');
const AuthEmailRoute = require('./routes/auth-email.routes');
const PopupRoute = require('./routes/popup.routes');
const UserRoute = require('./routes/user.routes');
const DoctorRoute = require('./routes/doctor.routes');
const MealRoute = require('./routes/meal.routes');
const EmailRoute = require('./routes/email.routes');
const TrackingRoute = require('./routes/trackingEmail.routes');


//Require Task
const cronTask = require('./tasks/cleanupUser');
const deleteUserTask = require('./tasks/deleteUser');
const deleteCode = require('./tasks/deleteCode');

//Require Function
const checkApiKey = require('./utils/checkApiKey');

//
//////////

//////////
//VARIABLE

const port = process.env.PORT
const app = express();
const mongoose = require('mongoose');

const passport = require('passport');
require('./config/passport-config')(passport);

//
//////////

// Pass routes accessible in email
app.use('/api', TrackingRoute);
app.use('/api', AuthEmailRoute);


//////////
//CONFIG API

// Can access to uploads directory
app.use('/uploads/public', express.static(path.join(__dirname, 'uploads/public')));

//Check if the api key exist
app.use(checkApiKey);

//Removes cors problems
app.use(cors());
// const corsOptions = {
//     origin: 'web site link',
//     optionsSuccessStatus: 200,
// };

//Helmet for safety, define safe header
app.use(helmet());

//Specify that the api will be in json
app.use(express.json());

//Allows you to analyze complex data structures.
app.use(express.urlencoded({extended:true}));

//Initialise passport
app.use(passport.initialize());

//////////
//////////

//////////
//API ROUTES

app.use('/api', AuthRoute);
app.use('/api', PopupRoute);
app.use('/api', UserRoute);
app.use('/api', DoctorRoute);
app.use('/api', MealRoute);
app.use('/api', EmailRoute);

//////////
//////////

//////////
//CRON TASK

//Delete account when the count is not activated for more than two weeks
cronTask();

//Remove personnal information for users who have requested deletion more than 30 days ago.
deleteUserTask();

//Deletes all validation codes that are no longer valid and not used
deleteCode();

//////////
//////////

//////////
//DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
.then((result)=> app.listen(port,()=>{
    console.log('Server running');
}))
.catch((err)=> console.log(err));

//////////
//////////