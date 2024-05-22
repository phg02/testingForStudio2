const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();
//stuff fot post
const multer = require('multer');
const Post = require('../models/Post');
const path = require('path');
//copy
const {ensureAuthenticated,forwardAuthenticated} =require('../config/auth');

const storage = multer.diskStorage({
    // Set the destination directory for uploaded files
    destination: (req, file, cb) => {
      cb(null,'public/images/uploads/postimage'); // Files will be saved in the 'uploads/' directory
    },
    // Set the filename for uploaded files
    filename: (req, file, cb) => {
      // Prepend the current timestamp to the original filename to ensure uniqueness
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  // Create a Multer instance with the configured storage settings
  const upload = multer({ storage: storage,
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
             req.fileValidationError = "Please select a valid image file";
             return cb(null, false, req.fileValidationError);
       }
       cb(null, true);
    }
   }).single('myFile');

//comunity page

router.get('/',ensureAuthenticated, (req, res) => {
    if(req.user.admin===true) {
        res.redirect('/admin/users');
        return;
    }
    res.render('community' , {user: req.user})
})

//create post route
router.get('/createpost',ensureAuthenticated ,(req, res) => {
    res.render('createPost' , {user: req.user})
});

//send post to db
router.post('/createpost',ensureAuthenticated, upload ,async (req, res) => {
    
    try{
        let imagepath;
        if (req.fileValidationError) {
            throw new Error(req.fileValidationError);
       }
        if(req.file != null){
            if (req.fileValidationError) {
                throw new Error(req.fileValidationError);
           }
            imagepath = req.file.path;
            imagepath = imagepath.replace('public', '');
        }
        else{
           imagepath = null;
        }
        const post = new Post({
            title: req.body.title,
            description: req.body.description,
            author:req.user._id,
            image: imagepath
        })
        await post.save();
        console.log(post);
        res.redirect('/community');
    }catch(err){
        res.render('settingError', { user: req.user, error: err.message });
    }
});

module.exports = router;