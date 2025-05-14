// Simple Mistral API client for EchoMind
// This is a simplified version that focuses on reliability

// Hardcoded API key - in a real app, this would be stored securely
const MISTRAL_API_KEY = '05HuhddoS0bpO42IaPDvXiWizFtnbP6N';

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

/**
 * Get a random fallback response
 * @returns A random response from the fallback responses
 */
const getFallbackResponse = () => {
  const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
  return FALLBACK_RESPONSES[randomIndex];
};

/**
 * Send a message to Mistral API and get a response
 * @param {string} message - The message to send to Mistral
 * @param {Array} conversationHistory - Optional conversation history for context
 * @returns {Promise<string>} - The response from Mistral or a fallback response
 */
export const sendMessageToMistral = async (message, conversationHistory = []) => {
  try {
    // Build messages array for the API
    const messages = [
      {
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
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    // Make API call
    const response = await fetch(MISTRAL_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small',
        messages,
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 1024
      })
    });

    // If response is not OK, use fallback
    if (!response.ok) {
      console.error('Mistral API error:', response.status, response.statusText);
      return getFallbackResponse();
    }

    // Parse response
    const data = await response.json();
    
    // If no valid choices, use fallback
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
      console.error('Invalid Mistral API response:', data);
      return getFallbackResponse();
    }

    // Return the content
    return data.choices[0].message.content;
  } catch (error) {
    // For any error, use fallback
    console.error('Error calling Mistral API:', error);
    return getFallbackResponse();
  }
};

export default {
  sendMessageToMistral
};
