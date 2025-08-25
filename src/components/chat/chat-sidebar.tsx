import { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X, Palette, Sparkles, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types/chat';

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  className?: string;
}

export function ChatSidebar({
  conversations,
  currentConversationId,
  onConversationSelect,
  onNewChat,
  onDeleteConversation,
  onUpdateTitle,
  className,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (conversation: Conversation): void => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveEdit = (): void => {
    if (editingId && editTitle.trim()) {
      onUpdateTitle(editingId, editTitle.trim());
      setEditingId(null);
      setEditTitle('');
    }
  };

  const handleCancelEdit = (): void => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={cn('flex h-full flex-col bg-muted/10', className)}>
      {/* Header */}
      <div className="space-y-4 p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Image className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-purple-500 rounded-full animate-pulse" />
            </div>
            <h2 className="text-lg font-semibold">Gallery</h2>
          </div>
          
          {/* Enhanced Quick Add Button */}
          <div className="relative group">
            <Button
              variant="outline"
              size="sm"
              onClick={onNewChat}
              className="
                h-8 px-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 
                hover:from-purple-500/20 hover:to-pink-500/20 
                border-purple-200/50 dark:border-purple-800/50 
                hover:border-purple-300 dark:hover:border-purple-600
                hover:shadow-md hover:scale-105 active:scale-95
                transition-all duration-200
                text-purple-700 dark:text-purple-300
                group
              "
            >
              <Plus className="h-3 w-3 mr-1 transition-transform group-hover:rotate-90 duration-200" />
              <span className="text-xs font-medium">Add</span>
            </Button>
          </div>
        </div>
        
        {/* Main CTA Button */}
        <div className="relative group">
          <Button
            onClick={onNewChat}
            className="
              w-full bg-gradient-to-r from-purple-500 to-pink-500 
              hover:from-purple-600 hover:to-pink-600 
              text-white border-0 shadow-lg
              hover:shadow-xl hover:shadow-purple-500/25
              transform hover:scale-[1.02] active:scale-[0.98]
              transition-all duration-200
              group overflow-hidden relative
            "
          >
            <div className="flex items-center justify-center gap-2 relative z-10">
              <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12 duration-200" />
              <span className="font-semibold">New Creation</span>
            </div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                'group relative flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-200',
                'hover:bg-muted/50',
                currentConversationId === conversation.id && 'bg-muted'
              )}
              onClick={() => onConversationSelect(conversation.id)}
            >
              <div className="relative">
                <Palette className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <Sparkles className="absolute -top-1 -right-1 h-2 w-2 text-pink-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                {editingId === conversation.id ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-7 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit();
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      autoFocus
                    />
                    {/* Save Button */}
                    <div className="relative group/save">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="
                          h-7 w-7 p-0 rounded-lg
                          bg-green-50 hover:bg-green-100 dark:bg-green-950/50 dark:hover:bg-green-900/50
                          text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300
                          border border-green-200/50 dark:border-green-800/50
                          hover:border-green-300 dark:hover:border-green-600
                          hover:shadow-sm hover:scale-110 active:scale-95
                          transition-all duration-200
                        "
                        onClick={handleSaveEdit}
                      >
                        <Check className="h-3 w-3 transition-transform group-hover/save:scale-110 duration-200" />
                      </Button>
                    </div>
                    
                    {/* Cancel Button */}
                    <div className="relative group/cancel">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="
                          h-7 w-7 p-0 rounded-lg
                          bg-gray-50 hover:bg-gray-100 dark:bg-gray-950/50 dark:hover:bg-gray-900/50
                          text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
                          border border-gray-200/50 dark:border-gray-800/50
                          hover:border-gray-300 dark:hover:border-gray-600
                          hover:shadow-sm hover:scale-110 active:scale-95
                          transition-all duration-200
                        "
                        onClick={handleCancelEdit}
                      >
                        <X className="h-3 w-3 transition-transform group-hover/cancel:rotate-90 duration-200" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {conversation.title}
                      </p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        {/* Edit Button */}
                        <div className="relative group/edit">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="
                              h-7 w-7 p-0 rounded-lg
                              bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50
                              text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300
                              border border-blue-200/50 dark:border-blue-800/50
                              hover:border-blue-300 dark:hover:border-blue-600
                              hover:shadow-sm hover:scale-110 active:scale-95
                              transition-all duration-200
                            "
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(conversation);
                            }}
                          >
                            <Edit3 className="h-3 w-3 transition-transform group-hover/edit:rotate-12 duration-200" />
                          </Button>
                          
                          {/* Tooltip-like label */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover/edit:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            Edit
                          </div>
                        </div>

                        {/* Delete Button */}
                        <div className="relative group/delete">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="
                              h-7 w-7 p-0 rounded-lg
                              bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/50
                              text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300
                              border border-red-200/50 dark:border-red-800/50
                              hover:border-red-300 dark:hover:border-red-600
                              hover:shadow-sm hover:scale-110 active:scale-95
                              transition-all duration-200
                            "
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteConversation(conversation.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 transition-transform group-hover/delete:rotate-12 duration-200" />
                          </Button>
                          
                          {/* Tooltip-like label */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover/delete:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            Delete
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(conversation.updated_at)}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {conversations.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <div className="relative mx-auto mb-4 w-fit">
              <Palette className="h-12 w-12 opacity-20" />
              <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-purple-500/30 animate-pulse" />
            </div>
            <p className="text-sm font-medium">Your gallery is empty</p>
            <p className="text-xs mt-1">Create your first AI masterpiece</p>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                <Image className="h-3 w-3 mr-1" />
                Powered by Imagen-4
              </Badge>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}