const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Only create the schema if the model doesn't already exist
const PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    UpdatedAt: {
        type: Date,
        default: Date.now
    }
});

// Check if model exists before creating it
module.exports = mongoose.models.Post || mongoose.model('Post', PostSchema);