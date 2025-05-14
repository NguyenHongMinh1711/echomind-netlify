import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4175;

// Define paths
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.error('Error: dist directory does not exist. Please run "npm run build" first.');
  process.exit(1);
}

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  next();
});

// Serve static files from the dist directory
app.use(express.static(distPath));

// For any other request, send the index.html file (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
  console.log('Environment variables:');
  console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL || 'not set');
  console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'set (hidden)' : 'not set');
  console.log('VITE_GEMINI_API_KEY:', process.env.VITE_GEMINI_API_KEY ? 'set (hidden)' : 'not set');
});
