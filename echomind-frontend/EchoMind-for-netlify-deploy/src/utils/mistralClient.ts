// Mistral API client for frontend
import { getSupabaseClient } from '../services/supabaseService';

// Default API key - in production, this should be stored securely
const DEFAULT_API_KEY = '05HuhddoS0bpO42IaPDvXiWizFtnbP6N';

// Try to get the API key from environment variables
const getDefaultApiKey = (): string => {
  // Try window.ENV_CONFIG first (for production builds)
  if (typeof window !== 'undefined' && (window as any).ENV_CONFIG?.MISTRAL_API_KEY) {
    return (window as any).ENV_CONFIG.MISTRAL_API_KEY;
  }

  // Then try window.ENV (for compatibility)
  if (typeof window !== 'undefined' && (window as any).ENV?.VITE_DEFAULT_MISTRAL_API_KEY) {
    return (window as any).ENV.VITE_DEFAULT_MISTRAL_API_KEY;
  }

  // Then try import.meta.env (for development)
  if (import.meta.env.VITE_DEFAULT_MISTRAL_API_KEY) {
    return import.meta.env.VITE_DEFAULT_MISTRAL_API_KEY;
  }

  console.warn('Mistral API key not found in environment variables, using hardcoded default');
  return DEFAULT_API_KEY;
};

// Mistral API endpoint
const MISTRAL_API_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';

// Fallback responses for when the API is unavailable
const FALLBACK_RESPONSES = [
  "I understand you're going through a difficult time. Would you like to talk more about what's troubling you?",
  "It sounds like you're dealing with a lot right now. Remember that it's okay to take things one step at a time.",
  "I'm here to support you through this. What would be most helpful for you right now?",
  "It's brave of you to share your feelings. Have you considered talking to a mental health professional about this?",
  "Deep breathing can sometimes help in moments of stress. Would you like to try a quick breathing exercise?"
];

// Interface for Mistral API request
interface MistralRequest {
  model: string;
  messages: {
    role: string;
    content: string;
  }[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

// Interface for Mistral API response
interface MistralResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Get the API key for Mistral
 * First tries to get the user's custom API key from settings
 * Falls back to the default API key if no custom key is found
 */
export const getMistralApiKey = async (): Promise<string> => {
  try {
    // Get the default API key from environment variables
    const defaultKey = getDefaultApiKey();
    console.log('Default Mistral API key available:', !!defaultKey);

    const supabase = getSupabaseClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('No authenticated user, using default Mistral API key');
      return defaultKey;
    }

    // Try to get user settings
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('use_custom_api_key, mistral_api_key')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.warn('Error fetching user settings:', error.message);
      return defaultKey;
    }

    if (!settings || !settings.use_custom_api_key || !settings.mistral_api_key) {
      console.log('No custom Mistral API key found in user settings, using default');
      return defaultKey;
    }

    console.log('Using custom Mistral API key from user settings');
    return settings.mistral_api_key;
  } catch (error) {
    console.error('Error getting Mistral API key:', error);
    return getDefaultApiKey();
  }
};

/**
 * Get a random fallback response
 * @returns A random response from the fallback responses
 */
const getFallbackResponse = (): string => {
  const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
  return FALLBACK_RESPONSES[randomIndex];
};

/**
 * Send a message to Mistral API and get a response
 * @param message The message to send to Mistral
 * @param conversationHistory Optional conversation history for context
 * @param useFallback Whether to use fallback responses if API fails
 * @returns The response from Mistral or a fallback response
 */
export const sendMessageToMistral = async (
  message: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [],
  useFallback: boolean = true
): Promise<string> => {
  try {
    console.log('Sending message to Mistral:', message);

    // For demo purposes, we can use fallback responses to avoid API issues
    // But let's try to use the real API first
    // if (process.env.NODE_ENV === 'development' && useFallback) {
    //   console.log('Using fallback response in development mode');
    //   return getFallbackResponse();
    // }

    // Get API key
    const apiKey = await getMistralApiKey();

    // Build conversation history
    const messages = [...conversationHistory];

    // Add system message
    messages.unshift({
      role: 'system',
      content: `You are EchoMind, a mental health support assistant.
      Your goal is to provide empathetic, supportive responses to users who may be
      experiencing mental health challenges like depression or anxiety.

      Guidelines:
      - Be empathetic and supportive, but don't try to diagnose
      - Suggest healthy coping strategies when appropriate
      - Encourage professional help for serious concerns
      - Keep responses concise (2-3 paragraphs maximum)
      - Be conversational and warm`
    });

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    // Prepare request
    const request: MistralRequest = {
      model: 'mistral-small',
      messages,
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 1024
    };

    console.log('Making API request to Mistral');

    // Log the request details (without the API key)
    console.log('Mistral API request:', {
      endpoint: MISTRAL_API_ENDPOINT,
      model: request.model,
      messageCount: request.messages.length,
      temperature: request.temperature,
      top_p: request.top_p,
      max_tokens: request.max_tokens
    });

    // Make API call
    const response = await fetch(MISTRAL_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });

    console.log('Received response from Mistral:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()])
    });

    // Parse response
    let data: MistralResponse;
    try {
      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      try {
        data = JSON.parse(responseText);
        console.log('Parsed Mistral API response:', data);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        if (useFallback) {
          console.log('Using fallback response due to JSON parse error');
          return getFallbackResponse();
        }
        throw new Error(`Failed to parse Mistral API response: ${parseError.message}`);
      }
    } catch (textError) {
      console.error('Error reading response text:', textError);
      if (useFallback) {
        console.log('Using fallback response due to response.text() error');
        return getFallbackResponse();
      }
      throw new Error(`Failed to read Mistral API response: ${textError.message}`);
    }

    // Check for errors
    if (!response.ok) {
      console.error('API error:', response.status, response.statusText, data);
      if (useFallback) {
        console.log('Using fallback response due to non-OK response');
        return getFallbackResponse();
      }
      throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
    }

    // Check if we have a valid response
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
      console.error('No valid response from API:', data);
      if (useFallback) {
        console.log('Using fallback response due to invalid response structure');
        return getFallbackResponse();
      }
      throw new Error('No valid response from Mistral API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Mistral API:', error);
    if (useFallback) {
      return getFallbackResponse();
    }
    throw error;
  }
};
