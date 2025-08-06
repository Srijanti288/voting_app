const mongoose = require('mongoose');
require('dotenv').config();


// Define the Local MongoDB connection URL
const LocalMongoURL = process.env.LOCAL_DB_URL;
//const MongoURL = process.env.DB_URL;


// Set up MongoDB connection
mongoose.connect(LocalMongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Get the default connection
// Mongoose maintains a default connection object representing the MongoDB connection.
const db = mongoose.connection;

// Define event listeners for database connection
db.on('connected', ()=>{
    console.log('Connected to MongoDB server');
});
db.on('error', (err)=>{
    console.log('MongoDB server connection error:',err);
});
db.on('disconnected', ()=>{
    console.log('MongoDB server disconnected');
});

// Export the Database connection
module.exports = db;