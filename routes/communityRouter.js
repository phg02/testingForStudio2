const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();
const {ensureAuthenticated,forwardAuthenticated} =require('../config/auth');


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

module.exports = router;