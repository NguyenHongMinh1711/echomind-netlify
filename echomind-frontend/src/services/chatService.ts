import { getSupabaseClient, handleSupabaseError } from './supabaseService';

// Chat message type
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  session_id: string;
}

// Chat session type
export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  last_message?: string;
  last_message_timestamp?: string;
}

// Chat service object for export
export const chat = {
  getRecentChats: getConversations,
  getMessages,
  sendMessage,
  createConversation,
  deleteChatSession: deleteConversation
};

// Get all conversations for the current user
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const supabase = getSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Create a new conversation
export const createConversation = async (title: string): Promise<Conversation> => {
  try {
    const supabase = getSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([{
        title,
        user_id: user.id,
        created_at: now,
        updated_at: now
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

// Get messages for a conversation
export const getMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  try {
    const supabase = getSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // First verify that the session belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      throw new Error('Chat session not found or access denied');
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Send a message and get AI response
export const sendMessage = async (sessionId: string, content: string): Promise<{ userMessage: ChatMessage, aiResponse: ChatMessage }> => {
  try {
    const supabase = getSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // First verify that the session belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      throw new Error('Chat session not found or access denied');
    }

    const now = new Date().toISOString();

    // First, save the user message
    const { data: userMessage, error: userMessageError } = await supabase
      .from('chat_messages')
      .insert([{
        content,
        role: 'user',
        session_id: sessionId,
        timestamp: now
      }])
      .select()
      .single();

    if (userMessageError) {
      throw userMessageError;
    }

    // Update session's updated_at timestamp and last message
    await supabase
      .from('chat_sessions')
      .update({
        updated_at: now,
        last_message: content,
        last_message_timestamp: now
      })
      .eq('id', sessionId);

    // Call the AI service function (this would be a Supabase Edge Function in production)
    // For now, we'll simulate an AI response
    const aiResponseText = `This is a simulated AI response to: "${content}"`;

    // Save the AI response
    const { data: aiResponse, error: aiResponseError } = await supabase
      .from('chat_messages')
      .insert([{
        content: aiResponseText,
        role: 'assistant',
        session_id: sessionId,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();

    if (aiResponseError) {
      throw aiResponseError;
    }

    return { userMessage, aiResponse };
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Delete a chat session and all its messages
export const deleteConversation = async (sessionId: string): Promise<void> => {
  try {
    const supabase = getSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // First verify that the session belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      throw new Error('Chat session not found or access denied');
    }

    // First delete all messages in the session
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('session_id', sessionId);

    if (messagesError) {
      throw messagesError;
    }

    // Then delete the session
    const { error: sessionDeleteError } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (sessionDeleteError) {
      throw sessionDeleteError;
    }
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};
