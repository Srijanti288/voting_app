const express = require('express');
const router = express.Router();
const Candidate = require('./../models/candidate');

router.post('/', async(req, res)=>{
    try {
        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();
        console.log('candidate created');
        res.status(201).json(response);
    } catch (err){
        console.log(err);
        res.status(404).json({error: 'Internal server error'});
    }
});

router.get('/', async (req,res)=>{
    try {
        const candidates = await Candidate.find();
        console.log('candidate data fetched');
        res.status(200).json(candidates);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.put('/:id', async (req,res)=>{
    try {
        const CandidateId = req.params.id;   // Extract the id from the URL.
        const updateData = req.body;        // Update data for the candidate
        const response = await Candidate.findByIdAndUpdate(CandidateId,updateData,{
            new: true,         // Return updated document
            runValidators: true,
        });

        if(!response){
            return res.status(404).json({error: 'Candidate not found'});
        }
        console.log('candidate updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.delete('/:id', async (req, res)=>{
    try {
        const CandidateId = req.params.id;   // Extract the id from the URL.
        const response = await Candidate.findByIdAndDelete(CandidateId);
        if(!response){
            return res.status(404).json({error: 'Candidate not found'});
            }
            console.log('candidate deleted');
            res.status(200).json(response);
            } catch (err) {
                console.log(err);
                res.status(500).json({error: 'Internal server error'});
                }
});


module.exports = router;