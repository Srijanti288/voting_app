const express = require('express');
const router = express.Router();
const User = require('../models/User');
const  { jwtAuthMiddleware, generateToken} = require('./../jwt');
const bcrypt = require('bcrypt');


// 🔐 SignUp Route to add a new user
router.post('/signup', async (req, res) => {
    const data = req.body; // { name, email, password, role, ... }

    try {
        // If the role is 'admin', check if an admin already exists
        if (data.role === 'admin') {
            const existingAdmin = await User.findOne({ role: 'admin' });
            if (existingAdmin) {
                return res.status(403).json({ message: 'Admin already exists. Only one admin allowed.' });
            }
        }

        // Check if user already exists by unique fields like email or aadhar
        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'User already registered with this aadhar card no.' });
        }

        // Create and save new user
        const newUser = new User(data);
        const response = await newUser.save();

        // Generate JWT token
        const payload = { id: response.id };
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
        // Check if user exists by aadhar card number
        const user = await User.findOne({ aadharCardNumber });
        if (!user) {
            return res.status(401).json({ message: 'Invalid Aadhar number or password' });
        }

        // Compare password using bcrypt
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid Aadhar number or password' });
        }

        // Generate JWT token
        const payload = {
            id: user.id
        }
        const token = generateToken(payload);

        // Respond with token
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

// 🔒 PUT /user/profile/password — change password
router.put('/profile/password',jwtAuthMiddleware, async (req,res)=>{
     try {
        const userId = req.user; // from token
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id); 
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ✅ Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // ✅ Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;