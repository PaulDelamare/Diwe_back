//////////
//REQUIRE
const mongoose = require('mongoose');
//////////
//////////

//////////
//SCHEMA
const MealSchema = new mongoose.Schema({
    id_user: {
        type:  mongoose.Schema.Types.ObjectId,
        required: true,
    },
    image_path: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    calories: {
        type : Number,
    },
    proteins: {
        type : Number,
    },
    lipids: {
        type : Number,
    },
    glucids: {
        type : Number,
    },
    fibers: {
        type : Number,
    },
    calcium: {
        type : Number,
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

//////////
//////////

//////////
//MODEL

const Meal = mongoose.model('Meal', MealSchema, 'meal');

//////////
//////////

//////////
//EXPORT
module.exports = Meal;
//////////