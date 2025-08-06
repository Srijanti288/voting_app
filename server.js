const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();
const passport = require ('./auth');

const PORT = process.env.PORT || 3000

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // req.body


app.use(passport.initialize());
const localAuthMiddleware = passport.authenticate('local',{session:false});

app.get('/',function (req, res) {
    res.send('Welcome to my Voting Application');
})

const userRoutes = require('./routes/userRoutes');    // Import the router files
const candidateRoutes = require ('./routes/candidateRoutes');

app.use('/user', userRoutes);                            // Use the routers
app.use('/candidates', candidateRoutes);



app.listen(PORT, () => {
    console.log('Server is running on port 3000');
});