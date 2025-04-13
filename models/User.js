const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
  },
  university: {
    type: String,
    required: [true, 'Please provide your university'],
  },
  profilePicture: {
    type: String,
    default: '', // Will store the base64 encoded image or URL
  },
  passwordHash: {
    type: String,
    required: function() {
      return !this.googleId; // Password is required only if not using Google OAuth
    },
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  phone: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
    maxlength: [500, 'Bio cannot be more than 500 characters'],
  },
  carInfo: {
    type: String,
    default: '',
  },
  licensePlate: {
    type: String,
    default: '',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema); 