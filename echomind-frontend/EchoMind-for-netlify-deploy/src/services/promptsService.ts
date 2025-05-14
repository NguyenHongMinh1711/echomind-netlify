import { getSupabaseClient, handleSupabaseError } from './supabaseService';

// Prompt type
export interface Prompt {
  id: string;
  content: string;
  created_at: string;
  active: boolean;
}

// Prompt response type
export interface PromptResponse {
  id: string;
  prompt_id: string;
  prompt_content: string;
  response: string;
  created_at: string;
  user_id: string;
  is_bookmarked: boolean;
}

// Get daily prompt
export const getDailyPrompt = async (): Promise<Prompt> => {
  try {
    const supabase = getSupabaseClient();
    
    // Get the most recent active prompt
    const { data, error } = await supabase
      .from('daily_prompts')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Get random prompt
export const getRandomPrompt = async (): Promise<Prompt> => {
  try {
    const supabase = getSupabaseClient();
    
    // Get all active prompts
    const { data, error } = await supabase
      .from('daily_prompts')
      .select('*')
      .eq('active', true);
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('No prompts available');
    }
    
    // Select a random prompt
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Get user's prompt responses
export const getPromptResponses = async (): Promise<PromptResponse[]> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('prompt_responses')
      .select(`
        *,
        prompts:prompt_id (content)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Transform the data to match PromptResponse interface
    return (data || []).map(item => ({
      id: item.id,
      prompt_id: item.prompt_id,
      prompt_content: item.prompts?.content || 'Unknown prompt',
      response: item.response,
      created_at: item.created_at,
      user_id: item.user_id,
      is_bookmarked: item.is_bookmarked || false
    }));
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Submit prompt response
export const submitPromptResponse = async (promptId: string, promptContent: string, response: string): Promise<PromptResponse> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('prompt_responses')
      .insert([{
        prompt_id: promptId,
        response,
        user_id: user.id,
        created_at: new Date().toISOString(),
        is_bookmarked: false
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      ...data,
      prompt_content: promptContent
    };
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Toggle bookmark status for a prompt response
export const toggleBookmark = async (responseId: string): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get current bookmark status
    const { data: currentResponse, error: getError } = await supabase
      .from('prompt_responses')
      .select('is_bookmarked')
      .eq('id', responseId)
      .eq('user_id', user.id)
      .single();
    
    if (getError) {
      throw getError;
    }
    
    // Toggle bookmark status
    const { error: updateError } = await supabase
      .from('prompt_responses')
      .update({
        is_bookmarked: !currentResponse.is_bookmarked
      })
      .eq('id', responseId)
      .eq('user_id', user.id);
    
    if (updateError) {
      throw updateError;
    }
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};
