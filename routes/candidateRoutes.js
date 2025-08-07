const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const {
    jwtAuthMiddleware,
    generateToken
} = require('./../jwt');
const User = require('./../models/User');


const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
            return false;
        }
        return true;
    } catch (err) {
        console.log(err);
    }
}

// POST route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) {
            return res.status(403).json({
                message: 'You are not authorized to perform this action'
            });
        }

        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();

        res.status(201).json({
            message: 'Candidate added successfully',
            candidate: response
        });
    } catch (err) {
        console.error('Error adding candidate:', err);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// GET route to get all the candidates
router.get('/', jwtAuthMiddleware, async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) {
            return res.status(403).json({
                message: 'You are not authorized to perform this action'
            });
        }

        const candidates = await Candidate.find();
        res.status(200).json({
            candidates
        });
    } catch (err) {
        console.error('Error fetching candidates:', err);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// PUT route to update a candidate
router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) {
            return res.status(403).json({
                message: 'You are not authorized to perform this action'
            });
        }

        const candidateId = req.params.candidateId;
        const updateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateId, updateData, {
            new: true, // return updated document
            runValidators: true, // ensure validation
        });

        if (!response) {
            return res.status(404).json({
                error: 'Candidate not found'
            });
        }

        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// DELETE route to delete a candidate
router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) {
            return res.status(403).json({
                message: 'You are not authorized to perform this action'
            });
        }

        const candidateId = req.params.candidateId; // Extract candidate ID from URL
        const response = await Candidate.findByIdAndDelete(candidateId);

        if (!response) {
            return res.status(404).json({
                error: 'Candidate not found'
            });
        }

        res.status(200).json({
            message: 'Candidate deleted successfully'
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// 🗳️ Vote Route
router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
    const candidateId = req.params.candidateId;
    const userId = req.user.id;

    try {
        // Check if candidate exists
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 🛑 Admins are not allowed to vote
        if (user.role === 'admin') {
            return res.status(403).json({ error: 'Admin is not allowed to vote' });
        }

        // 🔁 Check if the user has already voted
        if (user.isVoted) {
            return res.status(400).json({ error: 'You have already voted' });
        }

        // Update the candidate document to record the vote
        candidate.votes.push({user: userId});
        candidate.voteCount++;
        await candidate.save();

        // Update the user document
        user.isVoted = true;
        await user.save();

        res.status(201).json({ message: 'Vote cast successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 🗳️ Vote Count Route
router.get('/vote/count', async (req, res) => {
    try {
        // Fetch all candidates sorted by vote count (descending)
        const candidates = await Candidate.find().sort({ voteCount: -1 });
        
        // Map the candidates with party name and vote count
        const voteRecord = candidates.map(candidate => ({
            party: candidate.party,
            count: candidate.voteCount
        }));

        return res.status(200).json({ voteRecord });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;