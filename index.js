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

const passport = require('passport');
require('./config/passport-config')(passport);

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


//Launch the server
app.listen(port, ()=>{
    console.log('Server running');
});