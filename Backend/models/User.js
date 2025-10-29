const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long']
    },
    email: {
        type: String,
        required: function () { return !this.isChild; }, // Only required for non-child users
        unique: true,
        sparse: true, // Allows multiple null values (for child users)
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: true, // Required for all users now (including children)
        minlength: [8, 'Password must be at least 8 characters long']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isChild: {
        type: Boolean,
        default: false
    },
    parentUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () { return this.isChild; } // Required only for child users
    },
    age: {
        type: Number,
        required: function () { return this.isChild; } // Required only for child users
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    maxGifts: {
        type: Number,
        default: 1,
        min: [0, 'maxGifts must be zero or greater']
    },
    cluster: {
        type: String,
        default: null,
        trim: true
    },
    excludedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    includedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);