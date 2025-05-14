import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';

// Define the context type
interface SupabaseContextType {
  supabase: SupabaseClient;
  isInitialized: boolean;
  session: Session | null;
  error: Error | null;
}

// Create the context with a default value
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

// Helper function to add CSRF protection to headers
const addCSRFTokenToHeaders = (headers: Record<string, string>) => {
  // Get CSRF token from meta tag
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    return {
      ...headers,
      'X-CSRF-Token': csrfToken,
    };
  }
  return headers;
};

// Provider component
export const SupabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        setIsLoading(true);

        // Get environment variables - try window.ENV first, then fallback to import.meta.env
        const windowEnv = (window as any).ENV;
        const supabaseUrl = windowEnv?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL as string;
        const supabaseAnonKey = windowEnv?.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY as string;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Supabase URL or Anon Key is missing from environment variables');
        }

        // Create Supabase client with enhanced security
        const client = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
          },
          global: {
            headers: addCSRFTokenToHeaders({
              'X-Client-Info': 'EchoMind/1.0.0',
            }),
          },
        });

        // Get initial session
        const { data, error: sessionError } = await client.auth.getSession();

        if (sessionError) {
          console.warn('Error getting session:', sessionError.message);
        } else {
          setSession(data.session);
        }

        // Set up auth state change listener
        const { data: { subscription } } = client.auth.onAuthStateChange(
          (_event, newSession) => {
            setSession(newSession);
          }
        );

        setSupabase(client);
        setIsInitialized(true);

        // Clean up subscription on unmount
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error initializing Supabase:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize Supabase'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeSupabase();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">Connecting to EchoMind...</Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          p: 3
        }}
      >
        <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 500 }}>
          <Typography variant="h6">Connection Error</Typography>
          <Typography variant="body1">{error.message}</Typography>
        </Alert>
        <Typography variant="body2">
          Please check your internet connection and try again.
        </Typography>
      </Box>
    );
  }

  // Only render children when Supabase is initialized
  if (!isInitialized || !supabase) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <SupabaseContext.Provider value={{ supabase, isInitialized, session, error }}>
      {children}
    </SupabaseContext.Provider>
  );
};

// Custom hook to use the Supabase context
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export default SupabaseProvider;
