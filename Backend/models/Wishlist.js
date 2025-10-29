const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add an item name'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    link: {
        type: String,
        trim: true
    },
    priority: {
        type: Number,
        default: 3,
        min: 1,
        max: 5
    },
    purchased: {
        type: Boolean,
        default: false
    }
});

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [wishlistItemSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
wishlistSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Wishlist', wishlistSchema);