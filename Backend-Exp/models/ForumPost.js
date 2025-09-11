// models/ForumPost.js
import mongoose from "mongoose";

const forumPostSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['crop', 'equipment', 'market', 'general'],
        required: true
    }
    }, {
    timestamps: true
    });

    module.exports = mongoose.model('ForumPost', forumPostSchema);

    // models/ForumReply.js
    const mongoose = require('mongoose');

    const forumReplySchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForumPost',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    }
    }, {
    timestamps: true
});

module.exports = mongoose.model('ForumReply', forumReplySchema);