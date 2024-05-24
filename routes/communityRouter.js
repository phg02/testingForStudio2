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

router.get('/',ensureAuthenticated, async (req, res) => {
    if(req.user.admin===true) {
        res.redirect('/admin/users');
        return;
    }
    else{
        let query = Post.find();
        if(req.query.search != null && req.query.search != ''){
            query = query.regex('title', new RegExp(req.query.search, 'i'));
    
        }
        if(req.query.sortby == 'old'){
            query = query.sort({dateCreated: 1});
        }
        else{   
            query = query.sort({dateCreated: -1});
        }
        if(req.query.startDate != null && req.query.startDate != ''){
            query = query.where('dateCreated').gte(req.query.startDate);
        }
        if(req.query.endDate != null && req.query.endDate != ''){
            query = query.where('dateCreated').lte(req.query.endDate);
        }
        try{ 
            const allPosts = await query.populate('author').exec();
            res.render('community' , {user: req.user, allPosts: allPosts, searchOptions: req.query});
        }catch(err){
            console.log(err);
        }
    }
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

router.get('/imgpost/:id',ensureAuthenticated, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id).populate('author').exec();
        res.render('comment2', {user: req.user, post: post});
    }catch(err){
        console.log(err);
    }
})
router.get('/post/:id',ensureAuthenticated, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id).populate('author').exec();
        res.render('comment', {user: req.user, post: post});
    }catch(err){
        console.log(err);
    }
})

module.exports = router;