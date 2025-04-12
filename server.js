require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import models
const User = require('./models/User');
const Ride = require('./models/Ride');
const RideRequest = require('./models/RideRequest');
const Trip = require('./models/Trip');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // For development only. In production, specify your actual domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    console.log('MongoDB Database:', mongoose.connection.db.databaseName);
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Authentication Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });
    
    if (!user) {
      throw new Error();
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// API Routes

// User Routes
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, university, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, university, passwordHash });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ride Routes
app.get('/api/rides', async (req, res) => {
  try {
    const rides = await Ride.find({ status: 'open' })
      .populate('driverId', 'name email')
      .sort({ startTime: 1 });
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single ride by ID
app.get('/api/rides/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driverId', 'name email');
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/rides', auth, async (req, res) => {
  try {
    console.log('Received ride data:', req.body);
    console.log('User ID:', req.user._id);
    
    const ride = new Ride({
      ...req.body,
      driverId: req.user._id,
    });
    
    console.log('Created ride object:', ride);
    const savedRide = await ride.save();
    console.log('Saved ride:', savedRide);
    
    res.status(201).json(savedRide);
  } catch (error) {
    console.error('Error saving ride:', error);
    res.status(400).json({ message: error.message });
  }
});

// Ride Request Routes
app.post('/api/rides/:rideId/request', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride || ride.status !== 'open') {
      return res.status(400).json({ message: 'Ride not available' });
    }
    
    const request = new RideRequest({
      rideId: ride._id,
      passengerId: req.user._id,
    });
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch('/api/rides/:rideId/request/:requestId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await RideRequest.findById(req.params.requestId);
    const ride = await Ride.findById(req.params.rideId);
    
    if (!request || !ride) {
      return res.status(404).json({ message: 'Request or ride not found' });
    }
    
    if (ride.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    request.status = status;
    request.respondedAt = new Date();
    await request.save();
    
    if (status === 'accepted') {
      ride.availableSeats -= 1;
      if (ride.availableSeats === 0) {
        ride.status = 'full';
      }
      await ride.save();
    }
    
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Trip Routes
app.post('/api/trips', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.body.rideId);
    if (!ride || ride.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const trip = new Trip({
      ...req.body,
      driverId: req.user._id,
    });
    await trip.save();
    
    ride.status = 'closed';
    await ride.save();
    
    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch('/api/trips/:tripId/complete', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip || trip.driverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    trip.completed = true;
    trip.endTime = new Date();
    await trip.save();
    
    res.json(trip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 