import { supabase } from '@/lib/supabase';

export interface ImageGenerationRequest {
  prompt: string;
  aspect_ratio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
  safety_filter_level?: 'block_low_and_above' | 'block_medium_and_above' | 'block_only_high';
  output_format?: 'png' | 'jpg' | 'webp';
  conversation_id?: string;
  message_id?: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  image_url: string;
  generation_time_ms: number;
  prediction_id: string;
  metadata: {
    prompt: string;
    aspect_ratio: string;
    safety_filter_level: string;
    output_format: string;
    model_used: string;
  };
}

export interface ImageGenerationError {
  error: string;
}

export async function generateImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse | ImageGenerationError> {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error('Failed to get authentication session');
    }

    if (!session) {
      throw new Error('No active session. Please sign in again.');
    }

    console.log('🎨 Calling Supabase Edge Function for image generation:', {
      prompt: request.prompt,
      aspect_ratio: request.aspect_ratio,
      user_id: session.user.id
    });

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: {
        prompt: request.prompt,
        aspect_ratio: request.aspect_ratio || '4:3',
        safety_filter_level: request.safety_filter_level || 'block_medium_and_above',
        output_format: request.output_format || 'png',
        conversation_id: request.conversation_id,
        message_id: request.message_id,
      },
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      throw new Error(error.message || 'Failed to generate image');
    }

    if (!data || !data.success) {
      console.error('❌ Image generation failed:', data);
      throw new Error(data?.error || 'Image generation failed');
    }

    console.log('✅ Image generated successfully via Edge Function');
    return data as ImageGenerationResponse;

  } catch (error) {
    console.error('❌ Image generation service error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { error: errorMessage };
  }
}

// Helper function to get user's generated images
export async function getUserGeneratedImages(limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user images:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserGeneratedImages:', error);
    return [];
  }
}

// Helper function to detect if a message is an image request
export function isImageRequest(message: string): boolean {
  const imageKeywords = [
    'draw', 'create', 'generate', 'make', 'design', 'paint', 'sketch', 
    'render', 'visualize', 'illustrate', 'show', 'picture', 'image',
    'photo', 'artwork', 'art', 'portrait', 'landscape', 'scene'
  ];
  
  const messageWords = message.toLowerCase().split(' ');
  return imageKeywords.some(keyword => 
    messageWords.some(word => word.includes(keyword))
  );
}

// Helper function to suggest aspect ratio based on prompt
export function suggestAspectRatio(prompt: string): '9:16' | '16:9' | '3:4' | '4:3' | '1:1' {
  const landscapeKeywords = ['landscape', 'panorama', 'horizon', 'wide', 'cinematic', 'banner'];
  const portraitKeywords = ['portrait', 'person', 'face', 'tall', 'vertical', 'standing'];
  const squareKeywords = ['logo', 'icon', 'avatar', 'profile', 'square'];
  
  const lowerPrompt = prompt.toLowerCase();
  
  if (landscapeKeywords.some(keyword => lowerPrompt.includes(keyword))) {
    return '16:9';
  }
  
  if (portraitKeywords.some(keyword => lowerPrompt.includes(keyword))) {
    return '3:4';
  }
  
  if (squareKeywords.some(keyword => lowerPrompt.includes(keyword))) {
    return '1:1';
  }
  
  // Default to 4:3 for general content
  return '4:3';
}