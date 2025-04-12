const mongoose = require('mongoose');

const RideRequestSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: [true, 'Please provide a ride ID'],
  },
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a passenger ID'],
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'canceled'],
    default: 'pending',
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('RideRequest', RideRequestSchema); 