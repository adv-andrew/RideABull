// Simple script to load API keys from a separate file
// This file should be included in your .gitignore

// Store your API keys here
const API_KEYS = {
  GOOGLE_MAPS_API_KEY: "%GOOGLE_MAPS_API_KEY%" // This will be replaced during build
};

// Function to initialize the Google Maps API with the key
function loadGoogleMapsAPI() {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEYS.GOOGLE_MAPS_API_KEY}&callback=initMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', loadGoogleMapsAPI);
