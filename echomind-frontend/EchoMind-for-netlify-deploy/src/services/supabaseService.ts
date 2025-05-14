import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default values for Supabase
const DEFAULT_SUPABASE_URL = 'https://anpmiebatvfzfexxzobr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFucG1pZWJhdHZmemZleHh6b2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0NTk5NzcsImV4cCI6MjAzMzAzNTk3N30.Nh0Qs9OYrOWrXyB-XUO9Oe_DwN_-LQPliMFlXEBUo8A';

// Get environment variables
const getSupabaseUrl = (): string => {
  // Try window.ENV_CONFIG first (for production builds)
  if (typeof window !== 'undefined' && (window as any).ENV_CONFIG?.SUPABASE_URL) {
    return (window as any).ENV_CONFIG.SUPABASE_URL;
  }

  // Then try window.ENV (for compatibility)
  if (typeof window !== 'undefined' && (window as any).ENV?.VITE_SUPABASE_URL) {
    return (window as any).ENV.VITE_SUPABASE_URL;
  }

  // Then try import.meta.env (for development)
  if (import.meta.env.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL;
  }

  console.warn('Supabase URL not found in environment variables, using default');
  return DEFAULT_SUPABASE_URL;
};

const getSupabaseAnonKey = (): string => {
  // Try window.ENV_CONFIG first (for production builds)
  if (typeof window !== 'undefined' && (window as any).ENV_CONFIG?.SUPABASE_ANON_KEY) {
    return (window as any).ENV_CONFIG.SUPABASE_ANON_KEY;
  }

  // Then try window.ENV (for compatibility)
  if (typeof window !== 'undefined' && (window as any).ENV?.VITE_SUPABASE_ANON_KEY) {
    return (window as any).ENV.VITE_SUPABASE_ANON_KEY;
  }

  // Then try import.meta.env (for development)
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  console.warn('Supabase Anon Key not found in environment variables, using default');
  return DEFAULT_SUPABASE_ANON_KEY;
};

// Create a singleton Supabase client
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  try {
    const supabaseUrl = getSupabaseUrl();
    const supabaseAnonKey = getSupabaseAnonKey();

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'X-Client-Info': 'EchoMind/1.0.0',
        },
      },
    });

    return supabaseInstance;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    throw error;
  }
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any): string => {
  console.error('Supabase error:', error);

  if (error.message) {
    return error.message;
  }

  if (error.error_description) {
    return error.error_description;
  }

  return 'An unexpected error occurred. Please try again.';
};

// Export types
export type { SupabaseClient };
