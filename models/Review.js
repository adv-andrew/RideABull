const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        maxlength: 500
    },
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent users from reviewing themselves
ReviewSchema.pre('save', async function(next) {
    if (this.userId.toString() === this.authorId.toString()) {
        throw new Error('Users cannot review themselves');
    }
    next();
});

// Ensure one review per user per trip
ReviewSchema.index({ authorId: 1, tripId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema); 