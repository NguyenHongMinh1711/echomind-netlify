// Simple client for Mistral AI API
import { getSupabaseClient } from '../services/supabaseService';

// Default API key - should be replaced with user's key when available
const DEFAULT_MISTRAL_API_KEY = '05HuhddoS0bpO42IaPDvXiWizFtnbP6N';

// Message type for Mistral API
interface MistralMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Get the Mistral API key from user settings or use default
 */
const getMistralApiKey = async (): Promise<string> => {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return DEFAULT_MISTRAL_API_KEY;
    }
    
    // Try to get user's API key from settings
    const { data, error } = await supabase
      .from('user_settings')
      .select('mistral_api_key')
      .eq('user_id', user.id)
      .single();
    
    if (error || !data || !data.mistral_api_key) {
      return DEFAULT_MISTRAL_API_KEY;
    }
    
    return data.mistral_api_key;
  } catch (error) {
    console.error('Error getting Mistral API key:', error);
    return DEFAULT_MISTRAL_API_KEY;
  }
};

/**
 * Send a message to Mistral AI API and get a response
 * @param message The user message to send
 * @param conversationHistory Previous messages for context
 * @returns The AI response text
 */
export const sendMessageToMistral = async (
  message: string,
  conversationHistory: MistralMessage[] = []
): Promise<string> => {
  try {
    const apiKey = await getMistralApiKey();
    
    // Prepare the messages array with conversation history
    const messages: MistralMessage[] = [
      {
        role: 'system',
        content: `You are a supportive AI assistant for EchoMind, a mental well-being platform focused on helping individuals manage depression. 
        Provide empathetic, thoughtful responses. Offer practical advice when appropriate, but avoid making medical diagnoses or replacing professional care. 
        If someone appears to be in crisis, gently suggest they reach out to a mental health professional or crisis service.`
      },
      ...conversationHistory,
      { role: 'user', content: message }
    ];
    
    // Call Mistral API
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-small',
        messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Mistral API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Mistral API:', error);
    return 'I apologize, but I encountered an error processing your request. Please try again later.';
  }
};
