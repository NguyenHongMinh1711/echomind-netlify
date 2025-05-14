import { supabase } from './supabaseClient';

export const chat = {
  /**
   * Get all chat sessions for the current user
   * @returns {Promise<Array>} Array of chat session objects
   */
  getChatSessions: async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat sessions:', error.message);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getChatSessions:', error.message);
      throw error;
    }
  },

  /**
   * Get a specific chat session by ID
   * @param {string} id Chat session ID
   * @returns {Promise<Object>} Chat session object
   */
  getChatSession: async (id) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching chat session:', error.message);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getChatSession:', error.message);
      throw error;
    }
  },

  /**
   * Get all messages for a chat session
   * @param {string} sessionId Chat session ID
   * @returns {Promise<Array>} Array of chat message objects
   */
  getChatMessages: async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching chat messages:', error.message);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getChatMessages:', error.message);
      throw error;
    }
  },

  /**
   * Create a new chat session
   * @param {Object} session Chat session object
   * @returns {Promise<Object>} Created chat session object
   */
  createChatSession: async (session) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{ ...session, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating chat session:', error.message);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createChatSession:', error.message);
      throw error;
    }
  },

  /**
   * Send a message in a chat session
   * @param {string} sessionId Chat session ID
   * @param {string} content Message content
   * @returns {Promise<Object>} Created message object
   */
  sendMessage: async (sessionId, content) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create the user message
      const { data: userMessage, error: userMessageError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content,
          role: 'user',
          user_id: user.id
        }])
        .select()
        .single();

      if (userMessageError) {
        console.error('Error sending user message:', userMessageError.message);
        throw userMessageError;
      }

      // Update the chat session's last_message and updated_at
      await supabase
        .from('chat_sessions')
        .update({
          last_message: content,
          updated_at: new Date()
        })
        .eq('id', sessionId);

      return userMessage;
    } catch (error) {
      console.error('Error in sendMessage:', error.message);
      throw error;
    }
  },

  /**
   * Delete a chat session
   * @param {string} id Chat session ID
   * @returns {Promise<boolean>} Success status
   */
  deleteChatSession: async (id) => {
    try {
      // Delete all messages in the session first
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', id);

      if (messagesError) {
        console.error('Error deleting chat messages:', messagesError.message);
        throw messagesError;
      }

      // Then delete the session
      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', id);

      if (sessionError) {
        console.error('Error deleting chat session:', sessionError.message);
        throw sessionError;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteChatSession:', error.message);
      throw error;
    }
  }
};

export default chat;
