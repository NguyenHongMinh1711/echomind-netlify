// ESM version of the server
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import compression from 'compression';
import cors from 'cors';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting EchoMind server...');
console.log('Current directory:', __dirname);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Define paths
const distPath = path.join(__dirname, 'dist');
console.log('Dist path:', distPath);
console.log('Dist exists:', fs.existsSync(distPath));

const indexPath = path.join(distPath, 'index.html');
console.log('Index path:', indexPath);
console.log('Index exists:', fs.existsSync(indexPath));

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.error('Error: dist directory does not exist. Please run "npm run build" first.');
  process.exit(1);
}

// Apply middleware
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS for all routes

// Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files from the dist directory
app.use(express.static(distPath, {
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Set cache control headers based on file type
    if (path.endsWith('.html')) {
      // HTML files - no cache
      res.setHeader('Cache-Control', 'no-cache');
    } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      // Static assets - cache for 1 week
      res.setHeader('Cache-Control', 'public, max-age=604800');
    }
  }
}));

// For any other request, send the index.html file (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);

  // Log that server started successfully
  process.stdout.write('Server started successfully\n');

  // Force flush stdout
  if (process.stdout.isTTY) {
    process.stdout._handle.setBlocking(true);
  }
});
