# EchoMind Netlify Deployment Instructions

This document provides instructions for deploying the EchoMind application to Netlify.

## Prerequisites

- Netlify account
- Netlify CLI (optional for local deployment)

## Deployment Steps

### Option 1: Deploy via Netlify Dashboard

1. Log in to your Netlify account
2. Click "Add new site" > "Import an existing project"
3. Connect to your GitHub repository
4. Configure the build settings:
   - Build command: Leave empty (we're using pre-built files)
   - Publish directory: `dist`
5. Configure environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase project anonymous key
   - `VITE_DEFAULT_MISTRAL_API_KEY`: Your Mistral AI API key
   - `VITE_APP_ENV`: Set to "production"
6. Click "Deploy site"

### Option 2: Deploy via Netlify CLI

1. Install Netlify CLI if you haven't already:
   ```
   npm install -g netlify-cli
   ```

2. Log in to your Netlify account:
   ```
   netlify login
   ```

3. Initialize a new Netlify site:
   ```
   netlify init
   ```

4. Configure the build settings:
   - Build command: Leave empty (we're using pre-built files)
   - Publish directory: `dist`

5. Configure environment variables:
   ```
   netlify env:set VITE_SUPABASE_URL "your-supabase-url"
   netlify env:set VITE_SUPABASE_ANON_KEY "your-supabase-anon-key"
   netlify env:set VITE_DEFAULT_MISTRAL_API_KEY "your-mistral-api-key"
   netlify env:set VITE_APP_ENV "production"
   ```

6. Deploy the site:
   ```
   netlify deploy --prod
   ```

## Post-Deployment Steps

1. Verify that the site is working correctly
2. Test the authentication flow
3. Test the chat functionality
4. Test the journal functionality
5. Test the resources functionality
6. Test the daily prompts functionality

## Troubleshooting

If you encounter any issues during deployment, check the following:

1. Ensure that all environment variables are set correctly
2. Check the Netlify deployment logs for any errors
3. Verify that the Supabase project is accessible
4. Check that the Mistral AI API key is valid
