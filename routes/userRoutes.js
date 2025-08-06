const express = require('express');
const router = express.Router();
const User = require('../models/User');
const  { jwtAuthMiddleware, generateToken} = require('./../jwt');

// POST route to add a user
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;               // Assuming the request body contains the person data
        const newUser = new User(data);     // Create a new user document using the Mongoose model
        const response = await newUser.save();    // Save the new user ti the database.

        const payload = {
            id: response.id,
            aadharCardNumber: response.aadharCardNumber
        }
        const token = generateToken(payload);
        res.status(200).json({Response: response, Token : token});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error'});
    }
});

// GET method to get the user
router.get('/', async (req,res) => {
    try {
        const data =  await User.find();
        res.status(200).json(data);
    } catch (err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error'});
    }
});

router.get('/:roleType', async (req, res)=>{
    try{
        const roleType = req.params.roleType;
        if (roleType == 'voter' || roleType == 'admin'){
            const response = await User.find({role: roleType});
            res.status(200).json(response);
        } else{
            res.status(404).json({ error: 'Invalid role Type'});
        } 
    } catch (err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error'});
    }
});

module.exports = router;
