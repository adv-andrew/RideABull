// Simple build script to inject environment variables
const fs = require('fs');
const path = require('path');

// Read the .env file
const envFile = fs.readFileSync('.env', 'utf8');
const envVars = {};

// Parse the .env file
envFile.split('\n').forEach(line => {
  // Skip comments and empty lines
  if (line.startsWith('#') || !line.trim()) return;
  
  // Parse key=value pairs
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=').trim();
  
  if (key && value) {
    envVars[key.trim()] = value;
  }
});

// Read the env-loader.js file
let envLoaderContent = fs.readFileSync('env-loader.js', 'utf8');

// Replace placeholders with actual values
for (const [key, value] of Object.entries(envVars)) {
  const placeholder = `%${key}%`;
  envLoaderContent = envLoaderContent.replace(placeholder, value);
}

// Write the updated content to env-loader.min.js
fs.writeFileSync('env-loader.min.js', envLoaderContent);

console.log('Build completed successfully!');
console.log('env-loader.min.js has been created with your API keys.');
console.log('Make sure to add env-loader.min.js to your .gitignore file!');
