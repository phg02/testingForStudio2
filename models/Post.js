const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image:{
        type: String
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    likes: {
        type:[mongoose.Schema.Types.ObjectId],
        ref: 'User'
    },
    reported:{
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Post', postSchema);