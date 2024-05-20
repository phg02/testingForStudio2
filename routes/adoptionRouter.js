const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();
const {ensureAuthenticated,forwardAuthenticated} =require('../config/auth');



//adoption page
router.get('/',ensureAuthenticated, (req, res) => {
    res.render('adoption', {user: req.user})
})

//create listing
router.get('/createlisting',ensureAuthenticated ,(req, res) => {
    res.render('createPostPrice', {user: req.user})
});

//listing route
router.get('/listing',ensureAuthenticated ,(req, res) => {
    res.render('sellPet' , {user: req.user})
});

module.exports = router;