import { Moon, Sun, Menu, Sparkles, Palette, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/auth-context';
import { useUserProfile } from '@/hooks/use-user-profile';
import { ProfileDialog } from '@/components/profile/profile-dialog';

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

export function Header({ onToggleSidebar, title = "AI Image Studio" }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { signOut, user } = useAuth();
  const { profile } = useUserProfile();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <div className="md:hidden relative group">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSidebar}
            className="
              bg-gradient-to-r from-purple-500/10 to-pink-500/10 
              hover:from-purple-500/20 hover:to-pink-500/20
              border-purple-200/50 dark:border-purple-800/50
              hover:border-purple-300 dark:hover:border-purple-600
              text-purple-700 dark:text-purple-300
              hover:shadow-md hover:scale-105 active:scale-95
              transition-all duration-200
            "
          >
            <Menu className="h-4 w-4 transition-transform group-hover:rotate-180 duration-300" />
            <span className="ml-1 text-xs font-medium">Gallery</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Palette className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-pink-500 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
          
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            Imagen-4
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="outline" className="hidden md:flex text-xs bg-background/50 backdrop-blur">
          Google AI
        </Badge>

        {/* User Profile */}
        {user && (
          <ProfileDialog>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                  {profile?.full_name?.[0] || profile?.username?.[0] || user.email?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <Badge variant="outline" className="hidden sm:flex text-xs bg-background/50 backdrop-blur">
                {profile?.username || profile?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0]}
              </Badge>
            </div>
          </ProfileDialog>
        )}

        {/* Sign Out Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="
            bg-gradient-to-r from-red-500/10 to-pink-500/10 
            hover:from-red-500/20 hover:to-pink-500/20
            border-red-200/50 dark:border-red-800/50
            hover:border-red-300 dark:hover:border-red-600
            text-red-700 dark:text-red-300
            hover:shadow-md hover:scale-105 active:scale-95
            transition-all duration-200
          "
        >
          <LogOut className="h-4 w-4" />
          <span className="ml-1 text-xs font-medium hidden sm:inline">Sign Out</span>
        </Button>
        
        {/* Enhanced Theme Toggle Button */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`
              group relative overflow-hidden transition-all duration-300 ease-in-out
              ${theme === 'dark' 
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-yellow-400' 
                : 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-slate-700'
              }
              hover:shadow-lg hover:scale-105 active:scale-95
              min-w-[90px] justify-center
            `}
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 transition-transform group-hover:rotate-180 duration-300" />
                  <span className="text-xs font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 transition-transform group-hover:-rotate-12 duration-300" />
                  <span className="text-xs font-medium">Dark</span>
                </>
              )}
            </div>
            
            {/* Animated background */}
            <div className={`
              absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300
              ${theme === 'dark' 
                ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20' 
                : 'bg-gradient-to-r from-slate-600/20 to-slate-800/20'
              }
            `} />
          </Button>

          {/* Glow effect */}
          <div className={`
            absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
            ${theme === 'dark' 
              ? 'shadow-lg shadow-yellow-400/25' 
              : 'shadow-lg shadow-slate-400/25'
            }
          `} />
        </div>
      </div>
    </header>
  );
}