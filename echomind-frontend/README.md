# EchoMind Frontend

A React-based frontend for the EchoMind mental well-being platform.

## Overview

EchoMind is a mental well-being platform for individuals managing depression. It provides tools for journaling, conversational support, resources, and daily prompts to help users track and improve their mental health.

## Features

- **User Management**: Authentication, profile management, and settings
- **Journaling**: Create, edit, and view journal entries with mood tracking and insights
- **Conversational Support**: Chat with an AI assistant powered by Google's Gemini API
- **Resources**: Access a library of mental health resources
- **Daily Prompts**: Respond to daily reflection prompts
- **Progressive Web App**: Offline support, installable on devices
- **Accessibility**: Dark mode, keyboard navigation, screen reader support

## Tech Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: React Context API
- **Routing**: React Router
- **Form Handling**: Formik with Yup validation
- **Backend Integration**: Supabase (Authentication, Database, Storage)
- **Testing**: Jest and React Testing Library
- **PWA**: Workbox for service worker and offline support
- **Documentation**: JSDoc and Markdown

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/echomind-frontend.git
   cd echomind-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials and other configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Running Tests

```bash
# Run all tests
npm test

# Run minimal tests
npm run test:minimal

# Run end-to-end tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

### Verification Scripts

```bash
# Verify environment variables
npm run verify:env

# Verify Supabase Row Level Security policies
npm run verify:rls

# Run security audit
npm run security:audit
```

## Performance Optimizations

- **Code Splitting**: Lazy loading of routes and components
- **Image Optimization**: Responsive images with proper sizing and lazy loading
- **PWA Features**: Service worker for caching and offline support
- **Bundle Size Optimization**: Tree shaking and dynamic imports

## Security

### API Key Handling

- User-provided Gemini API keys are stored in Supabase with Row Level Security policies
- Default API key is used as a fallback when users don't provide their own
- API keys are never exposed in client-side code

### Row Level Security

Supabase Row Level Security policies are configured for all tables to ensure that users can only access their own data.

### Environment Variables

Make sure to set the following environment variables in your deployment environment:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `GA_MEASUREMENT_ID` (optional)
- `VAPID_PUBLIC_KEY` (optional)

## Documentation

- [API Documentation](docs/API.md)
- [User Guide](docs/USER_GUIDE.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
