import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/use-chat';
import { useAuth, AuthProvider } from '@/contexts/auth-context';
import { Header } from '@/components/layout/header';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatInterface } from '@/components/chat/chat-interface';
import { AuthForm } from '@/components/auth/auth-form';

function ChatApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    createNewConversation,
    selectConversation,
    sendMessage,
    removeConversation,
    updateTitle,
  } = useChat();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth form if user is not authenticated
  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          'w-80 border-r bg-muted/10 transition-all duration-300 ease-in-out',
          'md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'fixed md:relative z-30 h-full md:h-auto'
        )}>
          <ChatSidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onConversationSelect={(id) => {
              selectConversation(id);
              setSidebarOpen(false);
            }}
            onNewChat={() => {
              createNewConversation();
              setSidebarOpen(false);
            }}
            onDeleteConversation={removeConversation}
            onUpdateTitle={updateTitle}
          />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatInterface
            messages={messages}
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>

      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="ai-chat-theme"
    >
      <AuthProvider>
        <ChatApp />
      </AuthProvider>
    </ThemeProvider>
  );
}