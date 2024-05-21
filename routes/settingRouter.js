const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const imageMimeType = ['image/jpeg', 'image/png', 'image/gif'];
const fs = require('fs');
const path = require('path');
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, '/uploads/profilepic')
//     },
//     // fileFilter: function (req, file, cb) {
//     //         cb(null, imageMimeType.includes(file.mimetype),);
//     // },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now()+'-'+file.originalname;
//         cb(null, uniqueSuffix)
//     }
// });
//   const upload = multer({ storage: storage}); 
// Define file filter to only accept JPEG and PNG files
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//       cb(null, true); // Accept file
//     } else {
//       cb(new Error('Invalid file type. Only JPEG and PNG files are allowed.'), false); // Reject file
//     }
//   };
const storage = multer.diskStorage({
    // Set the destination directory for uploaded files
    destination: (req, file, cb) => {
      cb(null,'public/images/uploads/'); // Files will be saved in the 'uploads/' directory
    },
    // Set the filename for uploaded files
    filename: (req, file, cb) => {
      // Prepend the current timestamp to the original filename to ensure uniqueness
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  // Create a Multer instance with the configured storage settings
  const upload = multer({ storage: storage }).single('myFile');

//setting
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('setting', { user: req.user });
})

//update profile picture
router.post('/updateprofile', upload ,async (req, res) => {
    try{
        // if(req.file.filename !== undefined || req.file !== null){
        //     throw new Error('Please select a file');
        // }
        if(req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png' && req.file.mimetype !== 'image/gif'){
            throw new Error('Please select a valid image file');
        }
        // if (err instanceof multer.MulterError) {
        //     // Handle Multer-specific errors
        //     throw new(multer.MulterError)
        // } else {
        //     // Handle custom errors
        //     throw new Error(err.message);     
        // }
        let profilepath = req.file.path;
        profilepath = profilepath.replace('public', '');
        let user = await User.findById(req.user.id);
        user.profile = profilepath;
        await user.save();
        res.redirect('/setting');
    }
    catch(err){
        res.render('settingError', { user: req.user, error: err.message }); 
    }
});

//change theme
router.put('/updatetheme', ensureAuthenticated, async (req, res) => {
    let user = await User.findById(req.user.id);
    if (req.body.switchTheme) {
        user.theme = 'dark';
    }
    else {
        user.theme = 'light';
    }
    await user.save();
    res.redirect('/setting');
})

//update username
router.put('/updateusername', ensureAuthenticated, async (req, res) => {
    try {
        if (req.body.username === '') {
            throw new Error('username cannot be empty');
        }
        let user = await User.findById(req.user.id);
        user.username = req.body.username;
        await user.save();
        res.render('successSetting', { user: user, message: 'Username updated successfully' });
    }
    catch (err) {
        res.render('settingError', { user: req.user, error: err });
    }
});

//update password
router.put('/updatepassword', ensureAuthenticated, async (req, res) => {
    try {
        //find user old password
        let userChange = await User.findById(req.user.id);
        //check if old password is correct
        if (await bcrypt.compare(req.body.oldPassword, userChange.password)) {
            userChange.password = await bcrypt.hash(req.body.newPassword, 10);

        }
        else {
            throw new Error('wrong password');
        }
        //check if new password is empty
        if (req.body.newPassword === '') {
            throw new Error('New password cannot be empty');
        }
        //check if new password is less than 8 characters
        if (req.body.newPassword.length < 8) {
            throw new Error('New password must be at least 8 characters');
        }
        //check if new password and confirm password match
        if (req.body.newPassword != req.body.confirmPassword) {
            throw new Error('new passwords do not match');
        }
        //check if new password is same as old password
        if (req.body.oldPassword === req.body.newPassword) {
            throw new Error('New password cannot be same as old');

        }
        await userChange.save();

        res.render('successSetting', { user: req.user, message: 'Password updated successfully' });
    }
    catch (err) {
        res.render('settingError', { user: req.user, error: err.message });
    }


});

//deactivate account
router.put('/deactivate', ensureAuthenticated, async (req, res) => {
    try {
        let user = await User.findById(req.user.id);
        user.activate = false;
        await user.save();
        res.redirect('/setting');
    }
    catch (err){
        res.render('settingError', { user: req.user, error: err.message })
    }
});


//activate account
router.put('/activate', ensureAuthenticated, async (req, res) => {
    try {
        let user = await User.findById(req.user.id);
        user.activate = true;
        await user.save();
        res.redirect('/setting');
    }
    catch (err) {
        res.render('settingError', { user: req.user, error: err.message })
    }
});

module.exports = router;