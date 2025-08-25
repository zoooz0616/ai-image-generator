import { useState, useRef, KeyboardEvent } from 'react';
import { Send, ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ImageGenerationSettings } from './image-generation-settings';
import { isImageRequest } from '@/services/supabase-image';
import type { ImageGenerationRequest } from '@/services/supabase-image';

interface MessageInputProps {
  onSendMessage: (message: string, imageSettings?: Omit<ImageGenerationRequest, 'prompt'>) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  className,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [imageSettings, setImageSettings] = useState<Omit<ImageGenerationRequest, 'prompt'>>({
    aspect_ratio: '4:3',
    safety_filter_level: 'block_medium_and_above',
    output_format: 'png',
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isImageRequestMessage = isImageRequest(message);

  const handleSend = (): void => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), isImageRequestMessage ? imageSettings : undefined);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = (): void => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200; // Maximum height in pixels
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  return (
    <div className={cn('border-t bg-background p-4', className)}>
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* Input Container */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[52px] max-h-[200px] resize-none pr-12 py-3"
            rows={1}
          />
          
          {/* Image Generation Hint */}
          {isImageRequestMessage && (
            <div className="absolute right-12 top-3 flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <ImageIcon className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>

        {/* Enhanced Send Button */}
        <div className="relative group">
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            size="icon"
            className={`
              h-12 w-12 flex-shrink-0 relative overflow-hidden
              ${isImageRequestMessage 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 shadow-lg hover:shadow-xl hover:shadow-purple-500/25' 
                : 'bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl'
              }
              ${!message.trim() || disabled 
                ? 'opacity-50 cursor-not-allowed transform-none' 
                : 'hover:scale-105 active:scale-95'
              }
              transition-all duration-200
            `}
          >
            <div className="relative z-10 flex items-center justify-center">
              {disabled ? (
                <div className="animate-spin">
                  <Sparkles className="h-4 w-4" />
                </div>
              ) : isImageRequestMessage ? (
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-200" />
                </div>
              ) : (
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-200" />
              )}
            </div>

            {/* Shimmer effect for image requests */}
            {isImageRequestMessage && !disabled && (
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}

            {/* Ripple effect */}
            {!disabled && (
              <div className="absolute inset-0 rounded-md bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200" />
            )}
          </Button>

          {/* Glow effect */}
          {!disabled && (
            <div className={`
              absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
              ${isImageRequestMessage 
                ? 'shadow-lg shadow-purple-500/50' 
                : 'shadow-lg shadow-primary/50'
              }
            `} />
          )}
        </div>
      </div>

      {/* Enhanced Image Generation Interface */}
      <div className="max-w-4xl mx-auto">
        {isImageRequestMessage && (
          <div className="mb-4 p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <div className="absolute inset-0 h-5 w-5 bg-purple-500/20 rounded-full animate-ping" />
                </div>
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Imagen-4 Ready
                </span>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              
              <ImageGenerationSettings 
                onSettingsChange={setImageSettings}
                className="text-xs"
              />
            </div>
            
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-4 flex-wrap">
                <span>📐 {imageSettings.aspect_ratio}</span>
                <span>🛡️ {imageSettings.safety_filter_level?.replace('block_', '').replace('_', ' ')}</span>
                <span>📁 {imageSettings.output_format?.toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            {isImageRequestMessage ? (
              <span className="inline-flex items-center gap-1 font-medium text-purple-600 dark:text-purple-400">
                <Sparkles className="inline h-3 w-3" />
                Ready to create your masterpiece with Google's Imagen-4
              </span>
            ) : (
              <>
                <span className="font-medium">Press Enter to send</span> • <span>Shift+Enter for new line</span>
              </>
            )}
          </p>
          
          {!isImageRequestMessage && (
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                "draw a sunset"
              </span>
              <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full">
                "create a portrait"
              </span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                "make a logo"
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}