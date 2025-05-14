import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export a function to get a new client with a custom API key
export const getClientWithApiKey = (apiKey) => {
  return createClient(supabaseUrl, apiKey);
};

// Export a function to get the current user
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error.message);
    return null;
  }
  return data.user;
};

// Export a function to sign in with email and password
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Error signing in:', error.message);
    throw error;
  }
  
  return data;
};

// Export a function to sign up with email and password
export const signUpWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    console.error('Error signing up:', error.message);
    throw error;
  }
  
  return data;
};

// Export a function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
  
  return true;
};

// Export a function to reset password
export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) {
    console.error('Error resetting password:', error.message);
    throw error;
  }
  
  return data;
};

// Export a function to update password
export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) {
    console.error('Error updating password:', error.message);
    throw error;
  }
  
  return data;
};

// Export a function to update user profile
export const updateProfile = async (profile) => {
  const { data, error } = await supabase.auth.updateUser({
    data: profile,
  });
  
  if (error) {
    console.error('Error updating profile:', error.message);
    throw error;
  }
  
  return data;
};

// Export a function to get session
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error.message);
    throw error;
  }
  
  return data.session;
};

// Export a function to listen for auth changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

export default supabase;
