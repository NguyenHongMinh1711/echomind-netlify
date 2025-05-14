import { supabase } from './supabaseClient';

export const resources = {
  /**
   * Get all podcasts
   * @returns {Promise<Array>} Array of podcast objects
   */
  getPodcasts: async () => {
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching podcasts:', error.message);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPodcasts:', error.message);
      throw error;
    }
  },

  /**
   * Get all stories
   * @returns {Promise<Array>} Array of story objects
   */
  getStories: async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stories:', error.message);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getStories:', error.message);
      throw error;
    }
  },

  /**
   * Get a specific resource by type and ID
   * @param {string} type Resource type ('podcasts' or 'stories')
   * @param {string} id Resource ID
   * @returns {Promise<Object>} Resource object
   */
  getResourceById: async (type, id) => {
    try {
      const { data, error } = await supabase
        .from(type)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching ${type}:`, error.message);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error in getResourceById for ${type}:`, error.message);
      throw error;
    }
  },

  /**
   * Search resources by query
   * @param {string} query Search query
   * @returns {Promise<Object>} Object with podcasts and stories arrays
   */
  searchResources: async (query) => {
    try {
      // Search podcasts
      const { data: podcasts, error: podcastsError } = await supabase
        .from('podcasts')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,tags.cs.{${query}}`);

      if (podcastsError) {
        console.error('Error searching podcasts:', podcastsError.message);
        throw podcastsError;
      }

      // Search stories
      const { data: stories, error: storiesError } = await supabase
        .from('stories')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,category.ilike.%${query}%,tags.cs.{${query}}`);

      if (storiesError) {
        console.error('Error searching stories:', storiesError.message);
        throw storiesError;
      }

      return {
        podcasts: podcasts || [],
        stories: stories || []
      };
    } catch (error) {
      console.error('Error in searchResources:', error.message);
      throw error;
    }
  },

  /**
   * Get resources by category
   * @param {string} category Resource category
   * @returns {Promise<Object>} Object with podcasts and stories arrays
   */
  getResourcesByCategory: async (category) => {
    try {
      // Get podcasts by category
      const { data: podcasts, error: podcastsError } = await supabase
        .from('podcasts')
        .select('*')
        .eq('category', category);

      if (podcastsError) {
        console.error('Error fetching podcasts by category:', podcastsError.message);
        throw podcastsError;
      }

      // Get stories by category
      const { data: stories, error: storiesError } = await supabase
        .from('stories')
        .select('*')
        .eq('category', category);

      if (storiesError) {
        console.error('Error fetching stories by category:', storiesError.message);
        throw storiesError;
      }

      return {
        podcasts: podcasts || [],
        stories: stories || []
      };
    } catch (error) {
      console.error('Error in getResourcesByCategory:', error.message);
      throw error;
    }
  },

  /**
   * Get resources by tag
   * @param {string} tag Resource tag
   * @returns {Promise<Object>} Object with podcasts and stories arrays
   */
  getResourcesByTag: async (tag) => {
    try {
      // Get podcasts by tag
      const { data: podcasts, error: podcastsError } = await supabase
        .from('podcasts')
        .select('*')
        .contains('tags', [tag]);

      if (podcastsError) {
        console.error('Error fetching podcasts by tag:', podcastsError.message);
        throw podcastsError;
      }

      // Get stories by tag
      const { data: stories, error: storiesError } = await supabase
        .from('stories')
        .select('*')
        .contains('tags', [tag]);

      if (storiesError) {
        console.error('Error fetching stories by tag:', storiesError.message);
        throw storiesError;
      }

      return {
        podcasts: podcasts || [],
        stories: stories || []
      };
    } catch (error) {
      console.error('Error in getResourcesByTag:', error.message);
      throw error;
    }
  }
};

export default resources;
