// Global API key definition to ensure it's available everywhere
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

// Add a global function to get the Mistral API key
window.getMistralApiKey = function() {
  return window.MISTRAL_API_KEY;
};
