const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post'); 
const {ensureAuthenticated,forwardAuthenticated} =require('../config/auth');


//post profile route
router.get('/postprofile',ensureAuthenticated, async (req, res) => {
    try{
        let allPosts = await Post.find({author: req.user._id}).populate('author').sort({dateCreated: -1}).exec();
        res.render('profile-post', {user: req.user, allPosts: allPosts})
    }
    catch(err){
        console.log(err);
    }
    
})

//seller profile route
router.get('/sellerprofile',ensureAuthenticated ,(req, res) => {
    res.render('profile-sell' , {user: req.user});
});

module.exports = router;