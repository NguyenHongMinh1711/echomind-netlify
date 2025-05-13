# EchoMind - Netlify Deployment

This repository contains the deployment-ready version of the EchoMind application for Netlify.

## About EchoMind

EchoMind is a mental well-being platform for individuals managing depression, using JavaScript, Supabase (Supabase Functions, Postgres, Authentication, Storage), and Mistral AI, with core modules including User Management, Journaling, Conversational Support, Resources, and Daily Prompts.

## Deployment Instructions

### Prerequisites

- Netlify account
- Supabase project (URL and Anon Key)

### Deploying to Netlify

1. Connect this repository to Netlify
2. Configure the following environment variables in Netlify:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase project anonymous key
   - `VITE_DEFAULT_MISTRAL_API_KEY`: Your Mistral AI API key
   - `VITE_APP_ENV`: Set to "production"

3. Deploy the site

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Features

- User authentication via Supabase
- Journal entries with AI-powered analysis
- Conversational support with Mistral AI
- Resources for mental well-being
- Daily prompts for reflection

## Technology Stack

- React
- TypeScript
- Vite
- Material UI
- Supabase
- Mistral AI
