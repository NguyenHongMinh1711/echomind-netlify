import { getSupabaseClient, handleSupabaseError } from './supabaseService';

// Journal entry type
export type MoodType = 'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: MoodType;
  created_at: string;
  updated_at?: string;
  user_id: string;
}

// Get all journal entries for the current user
export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Get journal entries filtered by mood
export const getJournalEntriesByMood = async (mood: MoodType): Promise<JournalEntry[]> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('mood', mood)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Get a single journal entry by ID
export const getJournalEntry = async (id: string): Promise<JournalEntry> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Create a new journal entry
export const createJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<JournalEntry> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{
        ...entry,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Update an existing journal entry
export const updateJournalEntry = async (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'created_at' | 'user_id'>>): Promise<JournalEntry> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Delete a journal entry
export const deleteJournalEntry = async (id: string): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};
