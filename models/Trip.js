const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: [true, 'Please provide a ride ID'],
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a driver ID'],
  },
  passengerIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  routeCoordinates: [{
    lat: {
      type: Number,
      required: [true, 'Please provide latitude'],
    },
    lng: {
      type: Number,
      required: [true, 'Please provide longitude'],
    },
  }],
  startTime: {
    type: Date,
    required: [true, 'Please provide start time'],
  },
  endTime: {
    type: Date,
    default: null,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Trip', TripSchema); 