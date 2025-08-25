/**
 * Replicate Imagen-4 API Service
 * High-quality image generation using Google's Imagen 4 model
 */

// Imagen-4 API Types
export interface Imagen4Input {
  prompt: string;
  aspect_ratio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
  safety_filter_level?: 'block_low_and_above' | 'block_medium_and_above' | 'block_only_high';
  output_format?: 'png' | 'jpg' | 'webp';
}

export interface Imagen4Response {
  output: string; // URL to generated image
}

export interface ReplicateError {
  error: string;
  detail?: string;
}

// Replicate API Configuration
const REPLICATE_API_TOKEN = import.meta.env.VITE_REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  console.warn('Replicate API token not found. Please add VITE_REPLICATE_API_TOKEN to your .env file');
}

/**
 * Generates high-quality images using Google's Imagen 4 model via backend API
 */
export async function generateImageWithImagen4(
  prompt: string,
  options: Omit<Imagen4Input, 'prompt'> = {}
): Promise<string> {
  if (!prompt.trim()) {
    throw new Error('Prompt cannot be empty');
  }

  try {
    const input: Imagen4Input = {
      prompt: prompt.trim(),
      aspect_ratio: options.aspect_ratio || '4:3',
      safety_filter_level: options.safety_filter_level || 'block_medium_and_above',
      output_format: options.output_format || 'png',
    };

    console.log('🎨 Generating image with Imagen-4 via proxy server:', { prompt, ...options });

    // Call local proxy server to avoid CORS issues
    const response = await fetch('http://localhost:3001/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Proxy server error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.image_url) {
      throw new Error('No image URL returned from proxy server');
    }

    console.log('✅ Image generated successfully:', result.image_url);
    return result.image_url;

  } catch (error) {
    console.error('❌ Imagen-4 generation error:', error);
    throw error instanceof Error ? error : new Error('Failed to generate image with Imagen-4');
  }
}


/**
 * Enhanced image generation detection that includes Imagen-4 specific keywords
 */
export function isImageGenerationRequest(prompt: string): boolean {
  const imageKeywords = [
    // English terms
    'draw', 'create', 'generate', 'make', 'design', 'produce',
    'image', 'picture', 'photo', 'illustration', 'artwork', 'graphic',
    'paint', 'sketch', 'render', 'visualize', 'show me', 'depict',
    'photorealistic', 'abstract', 'typography', 'poster', 'greeting card',
    'comic', 'detailed', 'high resolution', '2k', 'fine detail',
    'painting', 'digital art', 'concept art', 'portrait', 'landscape',
    'still life', 'character design', 'logo', 'banner',
    
    // Korean terms - 기본 생성 용어
    '그려', '그려줘', '그려주세요', '만들어', '만들어줘', '만들어주세요',
    '생성', '생성해', '생성해줘', '생성해주세요', '제작', '디자인',
    
    // Korean terms - 이미지 관련
    '이미지', '사진', '그림', '삽화', '일러스트', '작품', '그래픽',
    
    // Korean terms - 스타일
    '그림을', '사진을', '이미지를', '작품을', '일러스트를',
    '페인팅', '스케치', '렌더링', '시각화', '묘사',
    '풍경', '인물', '캐릭터', '로고', '포스터',
    
    // Korean terms - 명령형
    '보여줘', '보여주세요', '그려봐', '만들어봐'
  ];
  
  const lowerPrompt = prompt.toLowerCase();
  
  // Check English patterns
  const englishMatch = imageKeywords.some(keyword => 
    keyword.includes(' ') ? lowerPrompt.includes(keyword) :
    lowerPrompt.includes(`${keyword} a `) || 
    lowerPrompt.includes(`${keyword} an `) ||
    lowerPrompt.includes(`${keyword} me `) ||
    lowerPrompt.includes(`${keyword} some `) ||
    lowerPrompt.startsWith(keyword) ||
    lowerPrompt.includes(` ${keyword} `)
  );
  
  // Check Korean patterns (simpler matching for Korean)
  const koreanKeywords = [
    '그려', '그려줘', '그려주세요', '만들어', '만들어줘', '만들어주세요',
    '생성', '생성해', '생성해줘', '생성해주세요', '제작', '디자인',
    '이미지', '사진', '그림', '삽화', '일러스트', '작품', '그래픽',
    '그림을', '사진을', '이미지를', '작품을', '일러스트를',
    '보여줘', '보여주세요', '그려봐', '만들어봐'
  ];
  
  const koreanMatch = koreanKeywords.some(keyword => prompt.includes(keyword));
  
  return englishMatch || koreanMatch;
}

/**
 * Suggests optimal aspect ratio based on prompt content
 */
export function suggestAspectRatio(prompt: string): Imagen4Input['aspect_ratio'] {
  const lowerPrompt = prompt.toLowerCase();
  
  // Portrait-oriented content
  if (lowerPrompt.includes('portrait') || lowerPrompt.includes('person') || 
      lowerPrompt.includes('face') || lowerPrompt.includes('character')) {
    return '3:4';
  }
  
  // Landscape-oriented content
  if (lowerPrompt.includes('landscape') || lowerPrompt.includes('scenery') || 
      lowerPrompt.includes('panorama') || lowerPrompt.includes('horizon')) {
    return '16:9';
  }
  
  // Mobile/story format
  if (lowerPrompt.includes('mobile') || lowerPrompt.includes('story') || 
      lowerPrompt.includes('vertical')) {
    return '9:16';
  }
  
  // Square for social media, logos, etc.
  if (lowerPrompt.includes('logo') || lowerPrompt.includes('icon') || 
      lowerPrompt.includes('social media') || lowerPrompt.includes('profile')) {
    return '1:1';
  }
  
  // Default to 4:3 for general use
  return '4:3';
}