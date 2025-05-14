#!/bin/bash

# EchoMind Deployment Script
# This script builds and deploys the EchoMind frontend to Netlify

# Exit on error
set -e

# Display banner
echo "======================================"
echo "EchoMind Frontend Deployment"
echo "======================================"

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "Error: .env.production file not found!"
  echo "Please create a .env.production file with the required environment variables."
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run tests
echo "Running tests..."
npm run test:minimal

# Run security audit
echo "Running security audit..."
npm run security:audit

# Build the application
echo "Building the application..."
npm run build

# Verify the build
if [ ! -d "dist" ]; then
  echo "Error: Build failed! The 'dist' directory was not created."
  exit 1
fi

# Deploy to Netlify
echo "Deploying to Netlify..."
if command -v netlify &> /dev/null; then
  netlify deploy --prod --dir=dist
else
  echo "Netlify CLI not found. Installing..."
  npm install -g netlify-cli
  netlify deploy --prod --dir=dist
fi

echo "======================================"
echo "Deployment complete!"
echo "======================================"
