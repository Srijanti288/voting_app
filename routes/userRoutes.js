const express = require('express');
const router = express.Router();
const User = require('../models/User');
const  { jwtAuthMiddleware, generateToken} = require('./../jwt');

// 🔐 Sign up route
router.post('/signup', async (req, res) => {
     const data = req.body;   // Assuming the request body contains the person data

    try {
         // Check if user already exists
        const existingUser = await User.findOne(data);
        if (existingUser) {
            return res.status(400).json({ message: 'User already registered' });
        }
        // Create new user
        const newUser = new User(data);     
        const response = await newUser.save();    // Save the new user to the database.

        // Generate token
        const payload = {
            id: response.id,
            aadharCardNumber: response.aadharCardNumber
        }
        const token = generateToken(payload);
        res.status(201).json({ message: 'User registered successfully', token: token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// 🔐 Login Route
router.post('/login', async (req, res) => {
    const { aadharCardNumber, password } = req.body;

    try {
        // 1. Check if user exists
        const user = await User.findOne({ aadharCardNumber });
        if (!user) {
            return res.status(401).json({ message: 'Invalid Aadhar number or password' });
        }

        // 2. Compare password using bcrypt
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid Aadhar number or password' });
        }

        // 3. Generate JWT token
        const payload = {
            id: user.id,
            aadharCardNumber: user.aadharCardNumber
        }
        const token = generateToken(payload);

        // 4. Respond with token
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// 🔒 GET /user/profile - Get current user's profile
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET method to get all the user
router.get('/', jwtAuthMiddleware, async (req,res) => {
    try {
        const data =  await User.find().select('-password');
        res.status(200).json(data);
    } catch (err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error'});
    }
});

// GET /user/:roleType - Fetch users based on role
router.get('/:roleType', async (req, res)=>{
    try{
        const roleType = req.params.roleType;    // const {roleType} = req.params;

        if (roleType == 'voter' || roleType == 'admin'){
            const users = await User.find({role: roleType}).select('-password'); // Exclude password
            res.status(200).json(users);
        } else{
            res.status(400).json({error: 'Invalid role type. Must be voter or admin.' });
        } 
    } catch (err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error'});
    }
});

module.exports = router;