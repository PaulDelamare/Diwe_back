//////////
//REQUIRE

const express = require('express');
require('dotenv').config();
const cors = require('cors');

//
//////////

//////////
//VARIABLE

const port = process.env.JWT_SECRET
const app = express();
const mongoose = require('mongoose');

const passport = require('passport');
// require('./config/passport-config')(passport);

//
//////////



//////////
//CONFIG API

//Removes cors problems
app.use(cors());

//Specify that the api will be in json
app.use(express.json());

//Allows you to analyze complex data structures.
app.use(express.urlencoded({extended:true}));


//Initialise passport
app.use(passport.initialize());


mongoose.connect(process.env.MONGO_URI)
.then((result)=> app.listen(process.env.PORT,()=>{
    console.log('Server running');
}))
.catch((err)=> console.log(err));

//Launch the server
// app.listen(3000, ()=>{
//     console.log('Server running');
// });