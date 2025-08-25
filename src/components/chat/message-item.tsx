import { User, Bot, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';

interface MessageItemProps {
  message: Message;
  isLoading?: boolean;
  className?: string;
}

export function MessageItem({ message, isLoading = false, className }: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-4 p-4', className)}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={cn(
          'text-xs font-medium',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className="flex-1 space-y-2">
        {/* Role Label */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {isUser ? 'You' : 'Assistant'}
          </span>
          {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        </div>

        {/* Message Body */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {message.message_type === 'image' && message.image_url ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{message.content}</p>
              <div className="relative overflow-hidden rounded-lg border bg-muted/10">
                <img
                  src={message.image_url}
                  alt="Generated image"
                  className="max-w-full h-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden p-8 text-center text-muted-foreground">
                  <p className="text-sm">Failed to load image</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              ) : (
                message.content
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground">
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
}