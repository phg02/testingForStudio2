const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();
const {ensureAuthenticated,forwardAuthenticated} =require('../config/auth');


//post profile route
router.get('/postprofile',ensureAuthenticated, (req, res) => {
    res.render('profile-post', {user: req.user})
})

//seller profile route
router.get('/sellerprofile',ensureAuthenticated ,(req, res) => {
    res.render('profile-sell' , {user: req.user});
});

module.exports = router;