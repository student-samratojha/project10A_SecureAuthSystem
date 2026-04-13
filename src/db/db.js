const mongoose = require("mongoose");
const mongoUri = process.env.MONGO_URI;
async function connectToDb() {  
    try{
        await mongoose.connect(mongoUri);
        console.log("connected to mongodb");
    }
    catch(error){
        console.log(error);
        process.exit(1);
    
    }
    }
    module.exports = connectToDb;