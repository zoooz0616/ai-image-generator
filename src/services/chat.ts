import { supabase } from '@/lib/supabase';
import type { Conversation, Message } from '@/types/chat';
import { generateTextResponse, generateImage } from './openai';
import { generateImageWithImagen4, isImageGenerationRequest } from './replicate';
import type { Imagen4Input } from './replicate';

/**
 * Creates a new conversation
 */
export async function createConversation(title: string = 'New Chat'): Promise<Conversation> {
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required to create conversation');
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({ 
      title,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create conversation: ${error.message}`);
  }

  return data;
}

/**
 * Fetches all conversations for the current user ordered by most recent
 */
export async function fetchConversations(): Promise<Conversation[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required to fetch conversations');
  }

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetches messages for a specific conversation
 */
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  return data || [];
}

/**
 * Saves a message to the database
 */
export async function saveMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required to save message');
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      ...message,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save message: ${error.message}`);
  }

  return data;
}

/**
 * Deletes a conversation and all its messages (only if owned by current user)
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required to delete conversation');
  }

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete conversation: ${error.message}`);
  }
}

/**
 * Updates conversation title (only if owned by current user)
 */
export async function updateConversationTitle(conversationId: string, title: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required to update conversation');
  }

  const { error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', conversationId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to update conversation title: ${error.message}`);
  }
}

/**
 * Processes user message and generates AI response
 */
export async function processMessage(
  conversationId: string, 
  userMessage: string,
  imageSettings?: Omit<Imagen4Input, 'prompt'>
): Promise<{
  userMsg: Message;
  assistantMsg: Message;
}> {
  // Get current user for user_id
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required to process message');
  }

  // Save user message
  const userMsg = await saveMessage({
    conversation_id: conversationId,
    user_id: user.id,
    role: 'user',
    content: userMessage,
    message_type: 'text',
  });

  try {
    // Determine if this is an image generation request
    const shouldGenerateImage = isImageGenerationRequest(userMessage);

    let assistantContent: string;
    let messageType: 'text' | 'image' = 'text';
    let imageUrl: string | null = null;

    if (shouldGenerateImage) {
      try {
        // Use Imagen-4 via proxy server
        console.log('🎨 Using Google Imagen-4 for image generation');
        
        const imagen4Options: Omit<Imagen4Input, 'prompt'> = {
          aspect_ratio: imageSettings?.aspect_ratio || '4:3',
          safety_filter_level: imageSettings?.safety_filter_level || 'block_medium_and_above',
          output_format: imageSettings?.output_format || 'png',
        };
        
        imageUrl = await generateImageWithImagen4(userMessage, imagen4Options);
        assistantContent = `I've created a high-quality image using Google's Imagen-4 model based on your request: "${userMessage}"`;
        messageType = 'image';
        
        console.log('✅ Image generated successfully via Imagen-4');
      } catch (error) {
        console.warn('⚠️ Imagen-4 failed, falling back to OpenAI DALL-E:', error);
        
        // Fallback to OpenAI DALL-E if Imagen-4 fails
        try {
          imageUrl = await generateImage(userMessage);
          assistantContent = `I've generated an image using DALL-E based on your request: "${userMessage}" (Imagen-4 was unavailable)`;
          messageType = 'image';
        } catch (fallbackError) {
          console.error('❌ Both image generation methods failed:', fallbackError);
          throw new Error('Image generation is currently unavailable. Please try again later.');
        }
      }
    } else {
      // Generate text response
      assistantContent = await generateTextResponse(userMessage);
    }

    // Save assistant response
    const assistantMsg = await saveMessage({
      conversation_id: conversationId,
      user_id: user.id,
      role: 'assistant',
      content: assistantContent,
      message_type: messageType,
      image_url: imageUrl,
    });

    return { userMsg, assistantMsg };
  } catch (error) {
    // Save error message
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const assistantMsg = await saveMessage({
      conversation_id: conversationId,
      user_id: user.id,
      role: 'assistant',
      content: `Sorry, I encountered an error: ${errorMessage}`,
      message_type: 'text',
    });

    return { userMsg, assistantMsg };
  }
}