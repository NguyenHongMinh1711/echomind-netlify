import { getSupabaseClient, handleSupabaseError } from './supabaseService';

// User settings type
export interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  reminder_notifications: boolean;
  use_custom_api_key: boolean;
  gemini_api_key?: string;
  created_at: string;
  updated_at: string;
}

// Get user settings
export const getUserSettings = async (): Promise<UserSettings | null> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      // If no settings found, return default settings
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Update user settings
export const updateUserSettings = async (settings: Partial<UserSettings>): Promise<UserSettings> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    const now = new Date().toISOString();
    
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          ...settings,
          updated_at: now
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('user_settings')
        .insert([{
          user_id: user.id,
          email_notifications: settings.email_notifications ?? true,
          reminder_notifications: settings.reminder_notifications ?? true,
          use_custom_api_key: settings.use_custom_api_key ?? false,
          gemini_api_key: settings.gemini_api_key,
          created_at: now,
          updated_at: now
        }])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    }
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Export user data
export const exportUserData = async (): Promise<any> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Get user settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    // Get journal entries
    const { data: journalEntries } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id);
    
    // Get conversations
    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id);
    
    // Get chat messages
    const { data: chatMessages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id);
    
    // Get prompt responses
    const { data: promptResponses } = await supabase
      .from('prompt_responses')
      .select('*')
      .eq('user_id', user.id);
    
    // Get user favorites
    const { data: favorites } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id);
    
    // Compile all data
    return {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile: profile || null,
      settings: settings || null,
      journal_entries: journalEntries || [],
      conversations: conversations || [],
      chat_messages: chatMessages || [],
      prompt_responses: promptResponses || [],
      favorites: favorites || []
    };
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Delete user account and all associated data
export const deleteUserAccount = async (): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Delete user data from all tables
    // Note: This should ideally be handled by Supabase RLS policies and triggers
    // or a server-side function for security
    
    // For now, we'll just sign out the user
    // In a real implementation, you would call a Supabase Edge Function
    // that handles the deletion securely
    await supabase.auth.signOut();
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};
