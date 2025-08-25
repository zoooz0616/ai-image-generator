interface OpenAITextResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface OpenAIImageResponse {
  data: {
    url: string;
  }[];
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Check if API key is valid (not the placeholder)
const isValidApiKey = OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here' && OPENAI_API_KEY.startsWith('sk-');

if (!isValidApiKey) {
  console.warn('OpenAI API key not found or invalid. Please add a valid VITE_OPENAI_API_KEY to your .env file');
}

/**
 * Generates text response from OpenAI GPT API
 */
export async function generateTextResponse(prompt: string): Promise<string> {
  if (!isValidApiKey) {
    return "I apologize, but I'm currently unable to generate text responses because the OpenAI API key is not properly configured. Please check your environment variables and ensure you have a valid OpenAI API key.";
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data: OpenAITextResponse = await response.json();
    return data.choices[0]?.message?.content || 'No response generated';
  } catch (error) {
    console.error('OpenAI text generation error:', error);
    throw error instanceof Error ? error : new Error('Failed to generate text response');
  }
}

/**
 * Generates image from OpenAI DALL-E API
 */
export async function generateImage(prompt: string): Promise<string> {
  if (!isValidApiKey) {
    throw new Error('OpenAI DALL-E image generation is not available because the API key is not properly configured.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data: OpenAIImageResponse = await response.json();
    return data.data[0]?.url || '';
  } catch (error) {
    console.error('OpenAI image generation error:', error);
    throw error instanceof Error ? error : new Error('Failed to generate image');
  }
}

/**
 * Detects if the prompt is asking for image generation
 */
export function isImageGenerationRequest(prompt: string): boolean {
  const imageKeywords = [
    'draw', 'create', 'generate', 'make', 'design',
    'image', 'picture', 'photo', 'illustration', 'artwork',
    'paint', 'sketch', 'render', 'visualize', 'show me'
  ];
  
  const lowerPrompt = prompt.toLowerCase();
  return imageKeywords.some(keyword => 
    lowerPrompt.includes(`${keyword} a `) || 
    lowerPrompt.includes(`${keyword} an `) ||
    lowerPrompt.includes(`${keyword} me `) ||
    lowerPrompt.startsWith(keyword)
  );
}