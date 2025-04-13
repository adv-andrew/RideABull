# 🚗 RideABull

<img src="images/rideabull logo top.svg" alt="RideABull Logo" width="200">

A secure, student-only rideshare platform exclusively for university students with .edu email addresses. RideABull connects students for safe, affordable rides to and from campus while reducing carbon footprint.

## 🌟 Features

- **🔒 Secure Authentication**: Google OAuth and email/password login with .edu email verification
- **👥 Student-Only Community**: Restricted to verified university students
- **🚗 Ride Management**: Create, find, and join rides to and from campus
- **🗺️ Route Visualization**: Google Maps integration for clear route planning
- **💰 Cost Sharing**: Split travel expenses with fellow students
- **🌱 Eco Impact**: Track CO₂ emissions saved through carpooling
- **👤 User Profiles**: Customizable profiles with university verification
- **📱 Responsive Design**: Clean, modern UI that works on all devices

## 🛠️ Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT, Passport.js, Google OAuth
- **Maps**: Google Maps API
- **File Storage**: GridFS for profile pictures
- **Security**: bcrypt for password hashing

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB Atlas account (or local MongoDB installation)
- Google Cloud Platform account for API keys

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rideabull.git
   cd rideabull
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   # API Keys
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   GEMINI_API_KEY=your_gemini_api_key

   # MongoDB Configuration
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## 🔐 Authentication Flow

1. **Email/Password Registration**:
   - Students register with a valid .edu email address
   - Email verification ensures university affiliation
   - Passwords are securely hashed using bcrypt

2. **Google OAuth**:
   - Students can sign in with their university Google accounts
   - Only .edu email addresses are accepted
   - Streamlined authentication process

3. **JWT Authentication**:
   - Secure token-based authentication for all API requests
   - Tokens expire for enhanced security

## 📱 Application Structure

- **Landing Page**: Introduction to RideABull with key features
- **Authentication Pages**: Login and registration with Google OAuth
- **Ride Listings**: Browse available rides with filters
- **Ride Details**: View route, driver info, and ride specifics
- **Ride Creation**: Post new rides with route planning
- **User Profile**: Manage personal information and preferences

## 🧪 Testing

To run tests:
```bash
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Google Maps API](https://developers.google.com/maps) for route visualization
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database hosting
- [Passport.js](http://www.passportjs.org/) for authentication strategies
- [Express](https://expressjs.com/) for the web framework

## 📞 Contact

For questions or support, please contact the development team at [your-email@example.com](mailto:your-email@example.com).
