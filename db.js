const mongoose = require('mongoose');

// Define the MongoDB connection URL
const MongoURL = 'mongodb://localhost:27017/Voting_Application_Database';

// Set up MongoDB connection
mongoose.connect(MongoURL, {
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