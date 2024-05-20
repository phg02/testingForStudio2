const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const router = express.Router();
const {ensureAuthenticated,forwardAuthenticated, ensureAuthenticatedAdmin} =require('../config/auth');

//User Model
const User = require('../models/User');
const { route } = require('./settingRouter');

//manage user
router.get('/users',ensureAuthenticated, ensureAuthenticatedAdmin, (req, res) => {
    res.render('adminUser', {user: req.user} )
})

//manage post
router.get('/post',ensureAuthenticated, ensureAuthenticatedAdmin ,(req, res) => {
    res.render('admin' , {user: req.user})
});

//manage seeling post
router.get('/adoption',ensureAuthenticated, ensureAuthenticatedAdmin ,(req, res) => {
    res.render('adminAdopt', {user: req.user})
})

//pet post for admin
router.get('/adoptionpost',ensureAuthenticated, ensureAuthenticatedAdmin ,(req, res) => {
    res.render('adminPet' , {user: req.user})
});

//admin user profile
router.get('/userprofile',ensureAuthenticated, ensureAuthenticatedAdmin ,(req, res) => {
    res.render('adminPost' , {user: req.user})
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