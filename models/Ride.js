const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a driver ID'],
  },
  origin: {
    name: {
      type: String,
      required: [true, 'Please provide origin name'],
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Please provide origin latitude'],
      },
      lng: {
        type: Number,
        required: [true, 'Please provide origin longitude'],
      },
    },
  },
  destination: {
    name: {
      type: String,
      required: [true, 'Please provide destination name'],
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Please provide destination latitude'],
      },
      lng: {
        type: Number,
        required: [true, 'Please provide destination longitude'],
      },
    },
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide start time'],
  },
  pricePerSeat: {
    type: Number,
    required: [true, 'Please provide price per seat'],
    min: [0, 'Price cannot be negative'],
  },
  availableSeats: {
    type: Number,
    required: [true, 'Please provide available seats'],
    min: [0, 'Available seats cannot be negative'],
  },
  totalSeats: {
    type: Number,
    required: [true, 'Please provide total seats'],
    min: [1, 'Total seats must be at least 1'],
  },
  preferences: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['open', 'full', 'closed', 'canceled'],
    default: 'open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Ride', RideSchema); 