import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnhancedImageMessage } from './enhanced-image-message';
import { MessageInput } from './message-input';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import type { Imagen4Input } from '@/services/replicate';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string, imageSettings?: Omit<Imagen4Input, 'prompt'>) => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  className,
}: ChatInterfaceProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages Area */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center min-h-[60vh] text-center">
              <div className="space-y-6 max-w-2xl">
                <div className="relative">
                  <div className="text-8xl mb-4">🎨</div>
                  <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Image Generator
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Transform your words into stunning visuals with Google's Imagen-4
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border">
                    <div className="text-2xl mb-2">🖼️</div>
                    <h3 className="font-semibold mb-2">High-Quality Images</h3>
                    <p className="text-sm text-muted-foreground">Create photorealistic and artistic images up to 2K resolution</p>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl border">
                    <div className="text-2xl mb-2">⚡</div>
                    <h3 className="font-semibold mb-2">Lightning Fast</h3>
                    <p className="text-sm text-muted-foreground">Powered by Google's latest Imagen-4 technology</p>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-6 mt-6">
                  <h4 className="font-medium mb-4 text-left">Try these prompts:</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-left p-2 rounded bg-background/50">
                      <span className="text-purple-500">•</span>
                      <span className="font-mono">"draw a majestic mountain landscape at sunset"</span>
                    </div>
                    <div className="flex items-center gap-2 text-left p-2 rounded bg-background/50">
                      <span className="text-pink-500">•</span>
                      <span className="font-mono">"create a futuristic city with flying cars"</span>
                    </div>
                    <div className="flex items-center gap-2 text-left p-2 rounded bg-background/50">
                      <span className="text-blue-500">•</span>
                      <span className="font-mono">"generate a cute cartoon character"</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message) => (
                <EnhancedImageMessage
                  key={message.id}
                  message={message}
                />
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <EnhancedImageMessage
                  message={{
                    id: 'loading',
                    conversation_id: '',
                    user_id: '',
                    role: 'assistant',
                    content: 'Generating your image...',
                    message_type: 'image',
                    created_at: new Date().toISOString(),
                  }}
                  isLoading={true}
                />
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <MessageInput
        onSendMessage={onSendMessage}
        disabled={isLoading}
        placeholder={
          messages.length === 0 
            ? "Start your conversation..." 
            : "Type your message..."
        }
      />
    </div>
  );
}