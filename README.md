# Ride A Bull

A student-only secure rideshare application with Google Maps integration.

## Environment Setup

This project uses environment variables to securely manage API keys. Follow these steps to set up your environment:

1. Create a `.env` file in the root directory of the project
2. Add your API keys to the `.env` file using the following format:

```
# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Add other API keys as needed
# GEMINI_API_KEY=your_gemini_api_key_here
# MIDNIGHT_API_KEY=your_midnight_api_key_here
```

3. Run the build script to generate the file with your API keys:

```bash
npm run build
```

This will create an `env-loader.min.js` file with your API keys that will be used by the application.

**Note:** Both the `.env` file and the generated `env-loader.min.js` file are included in `.gitignore` to prevent sensitive information from being pushed to your repository.

## How It Works

1. Your API keys are stored in the `.env` file
2. The build script (`build.js`) reads the `.env` file and creates `env-loader.min.js` with your actual API keys
3. The HTML files include `env-loader.min.js` which loads the Google Maps API with your key
4. When you push to Git, both `.env` and `env-loader.min.js` are ignored, keeping your API keys private

## Getting Started

To run the application locally:

1. Install dependencies (if any):
   ```bash
   npm install
   ```

2. Build the application to generate the API key file:
   ```bash
   npm run build
   ```

3. Open `ride_details.html` in your browser to see the application.

## Features

- 🚗 Ride Creation and Management
- 🗺️ Google Maps integration for route visualization
- 🌱 Eco-friendly CO₂ savings tracking
