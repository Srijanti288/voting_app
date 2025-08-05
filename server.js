const express = require('express');
const app = express();
const db = require('./db');

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // req.body

app.get('/', function (req, res) {
    res.send('Welcome to my Voting Application');
})









const userRoutes = require('./routes/userRoutes');    // Import the router files
const candidateRoutes = require ('./routes/candidateRoutes');

app.use('/user', userRoutes);                            // Use the router
app.use('/candidates', candidateRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});