//////////
//REQUIRE

const express = require('express');
require('dotenv').config();
const cors = require('cors');

//Require route
const AuthRoute = require('./routes/auth.routes');
const PopupRoute = require('./routes/popup.routes');
const UserRoute = require('./routes/user.routes');
const cronTask = require('./tasks/cleanupUser');

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

//////////
//CONFIG API

//Removes cors problems
// const corsOptions = {
//     origin: 'web site link',
//     optionsSuccessStatus: 200,
// };

app.use(cors());

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

//////////
//////////

//////////
//CRON TASK

cronTask();

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