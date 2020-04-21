const mongoose = require('mongoose');
const db_url = process.env.DB_URL;

const connectDB = async () => {
    try{
        await mongoose.connect(db_url, {
            useNewUrlParser : true,
            useCreateIndex : true,
            useUnifiedTopology : true,
            useFindAndModify : true
        });
        await console.log('connected')
    }
    catch(err){
        console.log(err);
        process.exit(1);
    }
}

module.exports = connectDB;