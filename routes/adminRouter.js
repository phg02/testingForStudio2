const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const router = express.Router();
const {ensureAuthenticated,forwardAuthenticated, ensureAuthenticatedAdmin} =require('../config/auth');

//User Model
const User = require('../models/User');
const { route } = require('./settingRouter');
const Post = require('../models/Post');
const AdoptionPost = require('../models/AdoptionPost');

//manage user
router.get('/users',ensureAuthenticated, ensureAuthenticatedAdmin, async (req, res) => {
    let query = User.find();
    if (req.query.search != null && req.query.search != '') {
        query = query.regex('username', new RegExp(req.query.search, 'i'));
    }
    if (req.query.sortby == 'Oldest user') {
        query = query.sort({dateCreated: 1});
    } else {
        query = query.sort({dateCreated: -1});
    }    
    try {
        const allUsers = await query.exec();
        res.render('adminUser', {user: req.user, allUsers: allUsers, search: req.query})
    } catch (err) {
        console.log(err);
    }
});

//manage post
router.get('/post',ensureAuthenticated, ensureAuthenticatedAdmin , async (req, res) => {
    let query = Post.find();
    if (req.query.search != null && req.query.search != '') {
        query = query.regex('title', new RegExp(req.query.search, 'i'));
    }
    if (req.query.sortbyTime == 'Oldest posts') {
        query = query.sort({dateCreated: 1});
    } else {
        query = query.sort({dateCreated: -1});
    }
    if (req.query.sortbyStatus == 'Reported posts') {
        query = query.where('reported').equals(true);
    }
    if (req.query.sortbyStatus == 'Deleted posts') {
        query = query.where('deleted').equals(true);
    }
    if (req.query.startDate != null && req.query.startDate != '') {
        query = query.where('dateCreated').gte(req.query.startDate);
    }
    //function to get the true end date
    function trueEndDate(date) {
        let dateArray = date.split('-');
        dateArray[2] = Number(dateArray[2]) + 1;
        return dateArray.join('-');
    }
    if (req.query.endDate != null && req.query.endDate != '') {
        query = query.where('dateCreated').lte(trueEndDate(req.query.endDate));
    }
    //modify above if needed
    try {
        const allPosts = await query.populate('author').exec();
        res.render('admin' , {user: req.user, allPosts: allPosts, search: req.query})
    } catch (err) {
        console.log(err);
    }
});

//manage seeling post
router.get('/adoption',ensureAuthenticated, ensureAuthenticatedAdmin, async (req, res) => {
    let query = AdoptionPost.find();
    if (req.query.search != null && req.query.search != '') {
        query = query.regex('title', new RegExp(req.query.search, 'i'));
    }
    if (req.query.sortby == 'Dog') {
        query = query.where('petType').equals('Dog');
    }
    if (req.query.sortby == 'Cat') {
        query = query.where('petType').equals('Cat');
    }
    try {
        const allPosts = await query.populate('author').exec();
        res.render('adminAdopt', {user: req.user, allPosts: allPosts, search: req.query, petType: req.query})
    } catch (err) {
        console.log(err);
    }
})

//pet post for admin
router.get('/adoptionpost',ensureAuthenticated, ensureAuthenticatedAdmin ,(req, res) => {
    res.render('adminPet' , {user: req.user})
});

//admin user profile
router.get('/userprofile/:id',ensureAuthenticated, ensureAuthenticatedAdmin , async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const allPosts = await Post.find().where('author').equals(req.params.id).populate('author').sort({dateCreated: -1}).exec();
        console.log(allPosts);
        res.render('adminPost' , {user: user, allPosts: allPosts})
    } catch (err) {
        console.log(err);
    } 
});

//admin user profile sell
router.get('/sellprofile',ensureAuthenticated, ensureAuthenticatedAdmin ,(req, res) => {
    res.render('adminSell' , {user: req.user})
});

//getting setting
router.get('/setting',ensureAuthenticated, ensureAuthenticatedAdmin ,(req, res) => {
    res.render('settingAdmin' , {user: req.user})
});

//change theme
router.put('/updatetheme',ensureAuthenticated, ensureAuthenticatedAdmin, async (req, res)=>{
    let user = await User.findById(req.user.id);
    if(req.body.switchTheme){
        user.theme = 'dark';
    }
    else{
        user.theme = 'light';
    }
    await user.save();
    res.redirect('/admin/setting');
})

//update password
router.put('/updatepassword',ensureAuthenticated, ensureAuthenticatedAdmin, async (req, res) => {
    try{
        //find user old password
        let userChange = await User.findById(req.user.id);
        //check if old password is correct
        if(await bcrypt.compare(req.body.oldPassword, userChange.password)){
            userChange.password = await bcrypt.hash(req.body.newPassword, 10);
           
        }
        else{
            throw new Error('wrong password');
        }
        //check if new password is empty
        if(req.body.newPassword === ''){
            throw new Error('New password cannot be empty');
        }
        //check if new password is less than 8 characters
        if(req.body.newPassword.length < 8){
            throw new Error('New password must be at least 8 characters');
        }
        //check if new password and confirm password match
        if(req.body.newPassword != req.body.confirmPassword){
            throw new Error('new passwords do not match');
        }
        //check if new password is same as old password
        if(req.body.oldPassword === req.body.newPassword){
            throw new Error('New password cannot be same as old');

        }
        await userChange.save();
        
        res.render('successSetting', {user: req.user, message: 'Password updated successfully'});
    }
    catch(err){
        res.render('settingError', {user: req.user ,error: err.message});
    }
    

});

module.exports = router;