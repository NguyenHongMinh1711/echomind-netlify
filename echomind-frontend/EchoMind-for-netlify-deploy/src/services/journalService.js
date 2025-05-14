import { supabase } from './supabaseClient';

export const journal = {
  /**
   * Get all journals for the current user
   * @returns {Promise<Array>} Array of journal objects
   */
  getJournals: async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching journals:', error.message);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getJournals:', error.message);
      throw error;
    }
  },

  /**
   * Get a specific journal by ID
   * @param {string} id Journal ID
   * @returns {Promise<Object>} Journal object
   */
  getJournal: async (id) => {
    try {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching journal:', error.message);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getJournal:', error.message);
      throw error;
    }
  },

  /**
   * Create a new journal entry
   * @param {Object} journal Journal object
   * @returns {Promise<Object>} Created journal object
   */
  createJournal: async (journal) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('journals')
        .insert([{ ...journal, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating journal:', error.message);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createJournal:', error.message);
      throw error;
    }
  },

  /**
   * Update an existing journal entry
   * @param {string} id Journal ID
   * @param {Object} updates Journal updates
   * @returns {Promise<Object>} Updated journal object
   */
  updateJournal: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('journals')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating journal:', error.message);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateJournal:', error.message);
      throw error;
    }
  },

  /**
   * Delete a journal entry
   * @param {string} id Journal ID
   * @returns {Promise<boolean>} Success status
   */
  deleteJournal: async (id) => {
    try {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting journal:', error.message);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteJournal:', error.message);
      throw error;
    }
  },

  /**
   * Get journal insights
   * @param {string} id Journal ID
   * @returns {Promise<Object>} Journal insights
   */
  getJournalInsights: async (id) => {
    try {
      const { data, error } = await supabase
        .from('journal_insights')
        .select('*')
        .eq('journal_id', id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching journal insights:', error.message);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getJournalInsights:', error.message);
      throw error;
    }
  }
};

export default journal;
