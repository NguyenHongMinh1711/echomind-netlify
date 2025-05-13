// EchoMind Environment Configuration
// This file provides environment variables for the application

// Define the Mistral API key directly as a global variable
window.MISTRAL_API_KEY = "05HuhddoS0bpO42IaPDvXiWizFtnbP6N";

// For backward compatibility
window.ENV = {
  VITE_SUPABASE_URL: "https://anpmiebatvfzfexxzobr.supabase.co",
  VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFucG1pZWJhdHZmemZleHh6b2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMTA2OTUsImV4cCI6MjA2MjU4NjY5NX0.G698WEjcHwl8fSx_oYNaf4oFnE-RHFJCcyZiZl13JTQ",
  VITE_GEMINI_API_KEY: "AIzaSyAbt4qhmxDkxuDwgkLtBRKbjY7jEzanxN8",
  VITE_DEFAULT_MISTRAL_API_KEY: window.MISTRAL_API_KEY,
  VITE_MISTRAL_API_KEY: window.MISTRAL_API_KEY,
  mistral_api_key: window.MISTRAL_API_KEY,
  MISTRAL_API_KEY: window.MISTRAL_API_KEY,
  DEFAULT_MISTRAL_API_KEY: window.MISTRAL_API_KEY,
  VITE_APP_ENV: "production"
};

// New configuration format
window.ENV_CONFIG = {
  SUPABASE_URL: "https://anpmiebatvfzfexxzobr.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFucG1pZWJhdHZmemZleHh6b2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMTA2OTUsImV4cCI6MjA2MjU4NjY5NX0.G698WEjcHwl8fSx_oYNaf4oFnE-RHFJCcyZiZl13JTQ",
  GEMINI_API_KEY: "AIzaSyAbt4qhmxDkxuDwgkLtBRKbjY7jEzanxN8",
  MISTRAL_API_KEY: window.MISTRAL_API_KEY,
  DEFAULT_MISTRAL_API_KEY: window.MISTRAL_API_KEY,
  VITE_MISTRAL_API_KEY: window.MISTRAL_API_KEY,
  VITE_DEFAULT_MISTRAL_API_KEY: window.MISTRAL_API_KEY,
  mistral_api_key: window.MISTRAL_API_KEY,
  APP_ENV: "production"
};

// Add global functions to get environment variables
window.getEnv = function(key, defaultValue) {
  // Try all possible locations
  return (
    // First check window.ENV_CONFIG
    (window.ENV_CONFIG && window.ENV_CONFIG[key]) ||
    // Then check window.ENV
    (window.ENV && window.ENV[key]) ||
    // Then check window.ENV with VITE_ prefix
    (window.ENV && window.ENV[`VITE_${key}`]) ||
    // Then check direct global variables
    window[key] ||
    // Finally return default value
    defaultValue
  );
};

// Specific getter for Mistral API key
window.getMistralApiKey = function() {
  return window.MISTRAL_API_KEY;
};

// Add a global function to validate API keys
window.validateApiKey = function(apiKey) {
  // Simple validation - check if it's a non-empty string
  return typeof apiKey === 'string' && apiKey.length > 0;
};

// Initialize default user settings in localStorage
if (!localStorage.getItem('echomind_user_settings')) {
  localStorage.setItem('echomind_user_settings', JSON.stringify({
    use_custom_api_key: false,
    mistral_api_key: window.MISTRAL_API_KEY,
    email_notifications: true,
    reminder_notifications: true
  }));
}

// Netlify-specific configuration
window.IS_NETLIFY = window.location.hostname.includes('netlify.app') ||
                   document.referrer.includes('netlify.app');

if (window.IS_NETLIFY) {
  console.log('Netlify environment detected, applying Netlify-specific configuration');

  // Ensure Mistral API key is set
  window.MISTRAL_API_KEY = "05HuhddoS0bpO42IaPDvXiWizFtnbP6N";

  // Update all references
  window.ENV.VITE_MISTRAL_API_KEY = window.MISTRAL_API_KEY;
  window.ENV.VITE_DEFAULT_MISTRAL_API_KEY = window.MISTRAL_API_KEY;
  window.ENV.mistral_api_key = window.MISTRAL_API_KEY;
  window.ENV.MISTRAL_API_KEY = window.MISTRAL_API_KEY;
  window.ENV.DEFAULT_MISTRAL_API_KEY = window.MISTRAL_API_KEY;

  window.ENV_CONFIG.MISTRAL_API_KEY = window.MISTRAL_API_KEY;
  window.ENV_CONFIG.DEFAULT_MISTRAL_API_KEY = window.MISTRAL_API_KEY;
  window.ENV_CONFIG.VITE_MISTRAL_API_KEY = window.MISTRAL_API_KEY;
  window.ENV_CONFIG.VITE_DEFAULT_MISTRAL_API_KEY = window.MISTRAL_API_KEY;
  window.ENV_CONFIG.mistral_api_key = window.MISTRAL_API_KEY;

  // Update user settings in localStorage
  try {
    const userSettings = JSON.parse(localStorage.getItem('echomind_user_settings') || '{}');
    userSettings.mistral_api_key = window.MISTRAL_API_KEY;
    localStorage.setItem('echomind_user_settings', JSON.stringify(userSettings));
  } catch (e) {
    console.error('Error updating user settings:', e);
    // Reset user settings
    localStorage.setItem('echomind_user_settings', JSON.stringify({
      use_custom_api_key: false,
      mistral_api_key: window.MISTRAL_API_KEY,
      email_notifications: true,
      reminder_notifications: true
    }));
  }
}

// Log environment configuration for debugging
console.log('EchoMind environment configuration loaded');
console.log('Supabase URL:', window.getEnv('SUPABASE_URL'));
console.log('Mistral API Key available:', !!window.getEnv('MISTRAL_API_KEY'));
console.log('Is Netlify environment:', window.IS_NETLIFY || false);
