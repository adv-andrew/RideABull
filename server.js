require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const { passport, generateToken } = require('./routes/auth');
const { ObjectId } = require('mongodb');

// Import models
const User = require('./models/User');
const Ride = require('./models/Ride');
const RideRequest = require('./models/RideRequest');
const Trip = require('./models/Trip');

const app = express();

// Create GridFS storage engine
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: 'profilePictures',
      filename: `profile-${Date.now()}-${file.originalname}`
    };
  }
});

// Create multer upload instance
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Middleware
app.use(cors({
  origin: '*', // For development only. In production, specify your actual domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase payload size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add error handling middleware for payload size errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 413) {
    return res.status(413).json({ 
      error: 'payload_too_large', 
      message: 'The uploaded file is too large. Maximum size is 10MB.' 
    });
  }
  next(err);
});

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    console.log('MongoDB Database:', mongoose.connection.db.databaseName);
    
    // Initialize GridFS
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('profilePictures');
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Authentication Middleware
const auth = async (req, res, next) => {
  try {
    // Check if Authorization header exists
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'missing_token', 
        message: 'Please authenticate. No token provided.' 
      });
    }

    // Extract token from Authorization header
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ 
        error: 'invalid_token_format', 
        message: 'Please authenticate. Invalid token format.' 
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ 
        error: 'invalid_token', 
        message: 'Please authenticate. Token is invalid or expired.' 
      });
    }

    // Find user
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(401).json({ 
        error: 'user_not_found', 
        message: 'Please authenticate. User not found.' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      error: 'authentication_error', 
      message: 'Please authenticate. An error occurred during authentication.' 
    });
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

// Complete profile endpoint
app.post('/api/users/complete-profile', async (req, res) => {
  try {
    const { tempToken, university, password } = req.body;
    
    if (!tempToken) {
      return res.status(400).json({ 
        error: 'invalid_token_format', 
        message: 'Invalid token format', 
        details: 'Temporary token is required' 
      });
    }
    
    // Verify the temporary token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ 
        error: 'token_expired', 
        message: 'Token expired or invalid', 
        details: error.message 
      });
    }
    
    // Check if the token is a temporary token
    if (!decoded.temp) {
      return res.status(401).json({ 
        error: 'invalid_token', 
        message: 'Invalid token type', 
        details: 'This endpoint requires a temporary token' 
      });
    }
    
    // Find the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'user_not_found', 
        message: 'User not found', 
        details: 'The user associated with this token does not exist' 
      });
    }
    
    // Update user information
    if (university) {
      user.university = university;
    }
    
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }
    
    await user.save();
    
    // Generate a new permanent token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    res.json({ 
      success: true,
      user, 
      token 
    });
  } catch (error) {
    console.error('Error completing profile:', error);
    res.status(500).json({ 
      error: 'server_error', 
      message: 'Server error', 
      details: error.message 
    });
  }
});

// Generate temporary token endpoint
app.get('/api/users/temp-token', auth, async (req, res) => {
  try {
    // Generate a temporary token that expires in 1 hour
    const tempToken = jwt.sign(
      { userId: req.user._id, temp: true }, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ tempToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile endpoint
app.put('/api/users/profile', auth, async (req, res) => {
  try {
    // Parse the request body as JSON
    const body = req.body;
    
    // Extract the profile picture from the body
    let profilePicture = null;
    if (body.profilePicture && typeof body.profilePicture === 'string' && body.profilePicture.startsWith('data:image')) {
      profilePicture = body.profilePicture;
      console.log('Profile picture received:', profilePicture.substring(0, 100) + '...');
    }
    
    const updates = {};
    
    if (body.name) updates.name = body.name;
    if (body.university) updates.university = body.university;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.bio !== undefined) updates.bio = body.bio;
    if (body.carInfo !== undefined) updates.carInfo = body.carInfo;
    if (body.licensePlate !== undefined) updates.licensePlate = body.licensePlate;
    
    // Handle profile picture
    if (profilePicture) {
      // Convert base64 to buffer
      const base64Data = profilePicture.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Create a file object for GridFS
      const file = {
        fieldname: 'profilePicture',
        originalname: 'profile.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: buffer,
        size: buffer.length
      };
      
      // Upload to GridFS
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = storage.createWriteStream();
        uploadStream.on('finish', (file) => {
          console.log('File uploaded to GridFS:', file);
          resolve(file);
        });
        uploadStream.on('error', (error) => {
          console.error('Error uploading to GridFS:', error);
          reject(error);
        });
        uploadStream.end(buffer);
      });
      
      try {
        const uploadedFile = await uploadPromise;
        // Store the ObjectId as a string
        updates.profilePicture = uploadedFile._id.toString();
        console.log('Profile picture saved to GridFS with ID:', updates.profilePicture);
      } catch (error) {
        console.error('Failed to upload profile picture to GridFS:', error);
        // Continue without the profile picture
      }
    }

    // Update password if provided
    if (body.newPassword) {
      updates.passwordHash = await bcrypt.hash(body.newPassword, 10);
    }

    console.log('Updating user with:', Object.keys(updates));
    
    // Use findByIdAndUpdate with the $set operator
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    console.log('User updated successfully. Profile picture saved:', !!user.profilePicture);

    res.json({ user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get user profile data
app.get('/api/users/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        error: 'user_not_found', 
        message: 'User not found' 
      });
    }
    
    // Get profile picture URL if it exists
    let profilePictureUrl = null;
    if (user.profilePicture) {
      try {
        console.log('User has profile picture:', user.profilePicture);
        
        // Validate that the profile picture ID is a valid ObjectId
        if (!ObjectId.isValid(user.profilePicture)) {
          console.log('Invalid profile picture ID format:', user.profilePicture);
        } else {
          // Check if the profile picture exists in GridFS
          const file = await gfs.files.findOne({ _id: new ObjectId(user.profilePicture) });
          if (file) {
            console.log('Profile picture found in GridFS:', file.filename);
            profilePictureUrl = `/api/users/profile-picture/${user.profilePicture}`;
          } else {
            console.log('Profile picture not found in GridFS');
          }
        }
      } catch (error) {
        console.error('Error finding profile picture in GridFS:', error);
      }
    } else {
      console.log('User has no profile picture');
    }
    
    res.json({
      name: user.name,
      email: user.email,
      university: user.university,
      phone: user.phone,
      bio: user.bio,
      carInfo: user.carInfo,
      licensePlate: user.licensePlate,
      profilePicture: profilePictureUrl,
      createdAt: user.createdAt,
      hasPassword: !!user.passwordHash
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ 
      error: 'server_error', 
      message: 'Server error', 
      details: error.message 
    });
  }
});

// Get profile picture from GridFS
app.get('/api/users/profile-picture/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Profile picture request for ID:', id);
    
    // Check if the ID is valid
    if (!id || id === 'undefined' || id === 'null') {
      console.log('Invalid profile picture ID:', id);
      return res.redirect('/default-profile.png');
    }
    
    // Validate ObjectId format before attempting conversion
    if (!ObjectId.isValid(id)) {
      console.log('Invalid ObjectId format:', id);
      return res.redirect('/default-profile.png');
    }
    
    // Try to convert to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
      console.log('Successfully converted to ObjectId:', objectId.toString());
    } catch (error) {
      console.log('Error converting to ObjectId:', id, error);
      return res.redirect('/default-profile.png');
    }
    
    // Find the file in GridFS
    const file = await gfs.files.findOne({ _id: objectId });
    
    if (!file) {
      console.log('Profile picture not found in GridFS:', id);
      return res.redirect('/default-profile.png');
    }
    
    console.log('Found profile picture in GridFS:', file.filename, 'Content-Type:', file.contentType);
    
    // Set the content type
    res.set('Content-Type', file.contentType);
    
    // Create a read stream and pipe it to the response
    const readStream = gfs.createReadStream({ _id: objectId });
    
    // Add error handling for the stream
    readStream.on('error', (error) => {
      console.error('Error streaming profile picture:', error);
      res.redirect('/default-profile.png');
    });
    
    readStream.pipe(res);
  } catch (error) {
    console.error('Error finding profile picture in GridFS:', error);
    res.redirect('/default-profile.png');
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

// Google OAuth Routes
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`/login.html?token=${token}`);
  }
);

// Update user profile
app.put('/api/users/me', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    // Handle profile picture if provided
    if (updates.profilePicture && updates.profilePicture.startsWith('data:image')) {
      // Process the base64 image and store it
      // This is a simplified version - in a real app, you'd save this to a file or cloud storage
      updates.profilePicture = updates.profilePicture;
    }
    
    // Update the user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user stats
app.get('/api/users/stats', auth, async (req, res) => {
  try {
    // For now, return mock stats
    // In a real app, you would calculate these from the database
    const stats = {
      ridesGiven: 0,
      ridesTaken: 0,
      averageRating: 0
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user reviews
app.get('/api/users/reviews', auth, async (req, res) => {
  try {
    // For now, return an empty array
    // In a real app, you would fetch reviews from the database
    const reviews = [];
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Serve static files from current directory (should be after API routes)
app.use(express.static('.'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use, trying port ${PORT + 1}`);
    app.listen(PORT + 1, () => {
      console.log(`Server is running on port ${PORT + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
}); 