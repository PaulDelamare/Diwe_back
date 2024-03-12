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
//FUNCTIONS

/**
+ * Create a new popup and save it in the database.
+ *
+ * @param {Object} newPopup - The new popup object containing image_path and text
+ * @param {Object} resulte - The resulte object
+ * @return {Promise} A promise that resolves to the saved daily_popup object
+ */
Meal.create = async (newMeal, resulte) => {
    //Get body information
    const { id_user, image_path, name, calories, proteins, lipids, glucids, fibers, calcium} = newMeal;

    //Create popup object
    const meal = new Meal({
        id_user,
        image_path,
        name,
        calories,
        proteins,
        lipids,
        glucids,
        fibers,
        calcium,
    });
    
    //Push in data base
    return meal.save();    
}

Meal.getLast = async (req, res) => {
    try {
        //Stock in variable limit
        const {number, id_user} = req.body;

        //Create query for get recent meals
        return Meal.find({ id_user: id_user })
        .sort({ created_at: -1 }).select('image_path name calories proteins lipids glucids fibers calcium created_at')
        .limit(number);

    } catch (error) {
        //If an error occurs, return an error
        console.log(error);
        throw error;  
    }
}

//////////
//////////

//////////
//EXPORT
module.exports = Meal;
//////////