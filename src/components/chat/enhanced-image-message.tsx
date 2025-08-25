import { useState } from 'react';
import { 
  Download, 
  Expand, 
  Copy, 
  Heart, 
  Share2, 
  Sparkles,
  Clock,
  Loader2,
  CheckCircle,
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface EnhancedImageMessageProps {
  message: Message;
  isLoading?: boolean;
  className?: string;
}

export function EnhancedImageMessage({ 
  message, 
  isLoading = false, 
  className 
}: EnhancedImageMessageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const isUser = message.role === 'user';
  const isImageMessage = message.message_type === 'image' && message.image_url;

  const handleDownload = async () => {
    if (!message.image_url) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(message.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `imagen-4-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download image');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    if (!message.image_url) return;
    navigator.clipboard.writeText(message.image_url);
    toast.success('Image link copied to clipboard!');
  };

  const handleShare = async () => {
    if (!message.image_url) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Generated Image',
          text: message.content,
          url: message.image_url,
        });
      } catch (error) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (!isImageMessage) {
    // Regular text message with enhanced styling
    return (
      <div className={cn(
        'group flex gap-4 p-6 transition-all duration-200 hover:bg-muted/30',
        className
      )}>
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarFallback className={cn(
            'text-sm font-medium',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
          )}>
            {isUser ? '👤' : '🤖'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Badge>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'group flex gap-4 p-6 transition-all duration-200 hover:bg-muted/30',
      className
    )}>
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <Sparkles className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">AI Image Generator</span>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              Imagen-4
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Badge>
          </div>
          
          {imageLoaded && (
            <TooltipProvider>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsLiked(!isLiked)}
                      className="h-8 w-8 p-0"
                    >
                      <Heart className={cn(
                        "h-4 w-4",
                        isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
                      )} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isLiked ? 'Unlike' : 'Like'}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="h-8 w-8 p-0"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download Image</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="h-8 w-8 p-0"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyLink}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy Link</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          )}
        </div>

        {/* Prompt */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-2">Prompt:</p>
          <p className="text-sm font-medium">{message.content}</p>
        </div>

        {/* Image */}
        <div className="relative">
          {isLoading ? (
            <div className="aspect-square w-full max-w-lg bg-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Sparkles className="h-12 w-12 text-purple-500 animate-pulse" />
                <div className="absolute inset-0 h-12 w-12 bg-purple-500/20 rounded-full animate-ping" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">Creating your masterpiece...</p>
                <p className="text-sm text-muted-foreground">Imagen-4 is generating a high-quality image</p>
                <div className="flex items-center justify-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative group/image">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative cursor-pointer overflow-hidden rounded-xl border bg-muted/10 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                    <img
                      src={message.image_url || ''}
                      alt="Generated image"
                      className="w-full h-auto max-w-lg"
                      onLoad={() => setImageLoaded(true)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden p-8 text-center text-muted-foreground">
                      <p className="text-sm">Failed to load image</p>
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                        <Expand className="h-5 w-5 text-gray-700" />
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                
                <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
                  <div className="relative">
                    <img
                      src={message.image_url || ''}
                      alt="Generated image"
                      className="w-full h-auto rounded-lg"
                    />
                    <DialogClose asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-4 right-4 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>

              {imageLoaded && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Generated
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Image metadata */}
        {imageLoaded && message.image_settings && (
          <div className="flex flex-wrap gap-2 text-xs">
            {message.image_settings.aspect_ratio && (
              <Badge variant="outline">
                Ratio: {message.image_settings.aspect_ratio}
              </Badge>
            )}
            {message.image_settings.output_format && (
              <Badge variant="outline">
                Format: {message.image_settings.output_format.toUpperCase()}
              </Badge>
            )}
            {message.image_settings.safety_filter && (
              <Badge variant="outline">
                Filter: {message.image_settings.safety_filter.replace('block_', '').replace('_', ' ')}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}