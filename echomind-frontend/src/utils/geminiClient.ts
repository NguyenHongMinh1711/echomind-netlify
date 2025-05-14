// Gemini API client for frontend
import { getSupabaseClient } from '../services/supabaseService';

// Default API key - in production, this should be stored securely
const DEFAULT_API_KEY = 'AIzaSyAbt4qhmxDkxuDwgkLtBRKbjY7jEzanxN8';

// Gemini API endpoint
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Fallback responses for when the API is unavailable
const FALLBACK_RESPONSES = [
  "I'm here to support you. How are you feeling today?",
  "It sounds like you're going through a challenging time. Remember that it's okay to take things one step at a time.",
  "Thank you for sharing that with me. What helps you feel better when you're experiencing these emotions?",
  "I'm listening. Would you like to talk more about what's on your mind?",
  "Self-care is important. Have you been able to do anything for yourself today?",
  "Remember that your feelings are valid, and it's okay to ask for help when you need it.",
  "Taking small steps forward is still progress. What's one small thing you could do today?",
  "I'm here to support you through this. What would be most helpful for you right now?",
  "It's brave of you to share your feelings. Have you considered talking to a mental health professional about this?",
  "Deep breathing can sometimes help in moments of stress. Would you like to try a quick breathing exercise?"
];

// Interface for Gemini API request
interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
}

// Interface for Gemini API response
interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
  promptFeedback?: {
    blockReason?: string;
  };
}

/**
 * Get the API key for Gemini
 * First tries to get the user's custom API key from settings
 * Falls back to the default API key if no custom key is found
 */
export const getGeminiApiKey = async (): Promise<string> => {
  try {
    const supabase = getSupabaseClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return DEFAULT_API_KEY;
    }

    // Try to get user settings
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('use_custom_api_key, gemini_api_key')
      .eq('user_id', user.id)
      .single();

    // If there's an error or no settings, or custom API key is not enabled, use default
    if (error || !settings || !settings.use_custom_api_key || !settings.gemini_api_key) {
      return DEFAULT_API_KEY;
    }

    return settings.gemini_api_key;
  } catch (error) {
    console.error('Error getting Gemini API key:', error);
    return DEFAULT_API_KEY;
  }
};

/**
 * Get a random fallback response when the API is unavailable
 */
const getFallbackResponse = (): string => {
  const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
  return FALLBACK_RESPONSES[randomIndex];
};

/**
 * Send a message to Gemini API and get a response
 * @param message The message to send to Gemini
 * @param conversationHistory Optional conversation history for context
 * @param useFallback Whether to use fallback responses if API fails
 * @returns The response from Gemini or a fallback response
 */
export const sendMessageToGemini = async (
  message: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [],
  useFallback: boolean = true
): Promise<string> => {
  try {
    console.log('Sending message to Gemini:', message);

    // For demo purposes, use the fallback responses to avoid API issues
    if (useFallback) {
      console.log('Using fallback response');
      return getFallbackResponse();
    }

    // Get API key
    const apiKey = await getGeminiApiKey();
    console.log('Using API key:', apiKey.substring(0, 5) + '...');

    // Prepare conversation context
    let prompt = '';

    // Add conversation history for context if available
    if (conversationHistory.length > 0) {
      prompt += "Previous conversation:\n";
      conversationHistory.forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      prompt += "\nCurrent message:\n";
    }

    // Add current message
    prompt += message;

    // Prepare request
    const request: GeminiRequest = {
      contents: [
        {
          parts: [
            {
              text: `You are EchoMind, a mental health support assistant.
              Your goal is to provide empathetic, supportive responses to users who may be
              experiencing mental health challenges like depression or anxiety.

              Guidelines:
              - Be empathetic and supportive, but don't try to diagnose
              - Suggest healthy coping strategies when appropriate
              - Encourage professional help for serious concerns
              - Keep responses concise (2-3 paragraphs maximum)
              - Be conversational and warm

              ${prompt}`
            }
          ]
        }
      ]
    };

    console.log('Making API request to Gemini');

    // Make API call
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    console.log('Received response from Gemini:', response.status);

    // Parse response
    const data: GeminiResponse = await response.json();

    // Check for errors
    if (!response.ok) {
      console.error('API error:', response.status, response.statusText, data);
      if (useFallback) {
        return getFallbackResponse();
      }
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    // Check for content filtering
    if (data.promptFeedback?.blockReason) {
      console.error('Content blocked:', data.promptFeedback.blockReason);
      if (useFallback) {
        return getFallbackResponse();
      }
      throw new Error(`Content was blocked: ${data.promptFeedback.blockReason}`);
    }

    // Check if we have a valid response
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content.parts[0].text) {
      console.error('No valid response from API:', data);
      if (useFallback) {
        return getFallbackResponse();
      }
      throw new Error('No valid response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (useFallback) {
      return getFallbackResponse();
    }
    throw error;
  }
};
