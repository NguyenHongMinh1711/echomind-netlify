import { getSupabaseClient, handleSupabaseError } from './supabaseService';

// User profile type
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

// Sign up with email and password
export const signUp = async (email: string, password: string): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Update password
export const updatePassword = async (newPassword: string): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Get current user profile
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const supabase = getSupabaseClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return null;
    }
    
    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      // Return basic user info even if profile fetch fails
      return {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at
      };
    }
    
    return {
      id: user.id,
      email: user.email || '',
      name: profile?.name,
      created_at: user.created_at
    };
  } catch (error) {
    console.error('Error getting current user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (profile: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const supabase = getSupabaseClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }
    
    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: user.id,
      email: user.email || '',
      name: data.name,
      created_at: user.created_at
    };
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};
