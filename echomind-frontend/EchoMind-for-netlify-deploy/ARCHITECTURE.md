# EchoMind Frontend Architecture

## Overview

EchoMind is a mental well-being platform built with React, TypeScript, and Material-UI, using Supabase for backend services. The frontend is designed to provide a seamless user experience with offline support, robust error handling, and a consistent UI.

## Directory Structure

```
echomind-frontend/
├── public/             # Static assets
├── src/
│   ├── assets/         # Images, icons, and other assets
│   ├── components/     # Reusable UI components
│   │   ├── auth/       # Authentication components
│   │   ├── chat/       # Chat interface components
│   │   ├── common/     # Shared UI components
│   │   ├── journal/    # Journal components
│   │   ├── resources/  # Resource components
│   │   └── user/       # User profile components
│   ├── contexts/       # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Page layout components
│   ├── pages/          # Page components
│   ├── routes/         # Routing configuration
│   ├── services/       # API and service integrations
│   ├── theme/          # Theme configuration
│   └── utils/          # Utility functions
└── ...                 # Configuration files
```

## Core Technologies

- **React 19**: Frontend library for building user interfaces
- **TypeScript**: Static typing for JavaScript
- **Material-UI 7**: UI component library
- **Vite**: Build tool and development server
- **Supabase**: Backend-as-a-Service for authentication, database, and storage
- **React Router 7**: Routing library
- **Formik + Yup**: Form handling and validation
- **IndexedDB**: Browser database for offline support
- **PWA**: Progressive Web App capabilities

## Architecture Patterns

### Component Structure

Components are organized by feature (auth, chat, journal, resources, user) and follow a consistent pattern:

1. **Container Components**: Handle data fetching, state management, and business logic
2. **Presentational Components**: Focus on rendering UI based on props
3. **Common Components**: Reusable UI elements shared across features

### State Management

The application uses a combination of state management approaches:

1. **React Context**: For global state (auth, theme, network, errors)
2. **Local Component State**: For component-specific state
3. **Custom Hooks**: For reusable stateful logic

### Data Flow

1. **API Layer**: Services handle communication with Supabase and external APIs
2. **Context Providers**: Manage global state and provide it to components
3. **Container Components**: Fetch data and manage local state
4. **Presentational Components**: Render UI based on props

## Key Features

### Authentication

- User registration and login
- Password reset
- Profile management
- Session persistence

### Offline Support

- Data synchronization between Supabase and IndexedDB
- Network status detection and handling
- Queuing operations when offline

### Error Handling

- Global error management
- Component-level error boundaries
- Consistent error UI
- Retry mechanisms

### Responsive Design

- Mobile-first approach
- Adaptive layouts
- Touch-friendly interactions

## Core Components

### Contexts

- **AuthContext**: Manages user authentication state
- **SupabaseContext**: Provides access to Supabase client
- **ThemeContext**: Manages theme preferences
- **NetworkContext**: Tracks network status and sync operations
- **ErrorContext**: Manages global error state

### Services

- **SupabaseService**: Standardized methods for Supabase interaction
- **ApiClient**: Generic HTTP client for external APIs
- **SyncService**: Handles offline data synchronization
- **IndexedDBService**: Manages local database operations

### Common UI Components

- **ErrorBoundary**: Catches and displays component errors
- **ErrorAlert**: Displays error messages
- **LoadingIndicator**: Shows loading states
- **NetworkStatusIndicator**: Displays network status
- **withLoadingAndError**: HOC for loading and error states

### Custom Hooks

- **useApiRequest**: Handles API requests with loading and error states
- **useNetwork**: Provides network status information
- **useError**: Provides error management functions

## Data Models

### User

- Authentication data
- Profile information
- Preferences

### Journal

- Journal entries
- Mood tracking
- Analysis results

### Chat

- Chat sessions
- Messages
- AI responses

### Resources

- Mental health resources
- Categories
- Content

## Security Considerations

- Authentication handled by Supabase
- API keys stored in environment variables
- Row-level security in Supabase
- Content security policy
- HTTPS only

## Performance Optimizations

- Code splitting
- Lazy loading
- Memoization
- Asset optimization
- Service worker caching

## Testing Strategy

- Unit tests with Vitest
- Component tests with React Testing Library
- Mock services for API testing
- Accessibility testing
- End-to-end testing (planned)

## Deployment

- Netlify for hosting
- Environment-specific configuration
- Continuous integration
- Progressive Web App capabilities

## Future Enhancements

- Enhanced offline capabilities
- Push notifications
- Advanced analytics
- Improved accessibility
- Mobile app versions
