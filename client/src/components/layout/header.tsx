import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sun, Moon, Bell, Settings, User as UserIcon, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onSearchChange?: (query: string) => void;
}

const Header = ({ activeView, setActiveView, onSearchChange }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const getUserInitials = (username: string) => {
    return username ? username.substring(0, 2).toUpperCase() : "U";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800 h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* App Title */}
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <h1 className="ios-header hidden sm:block">Trader's Daily Intel</h1>
        </div>

        {/* App Navigation - Replaced with Search Input */}
        <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              type="search"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => {
                const query = e.target.value;
                setSearchQuery(query);
                onSearchChange?.(query);
              }}
              className="w-full h-9 pl-10 pr-4 py-2 rounded-full text-sm 
                         bg-white/80 dark:bg-neutral-800/80 
                         backdrop-blur-md 
                         border border-white/20 dark:border-neutral-700/20 
                         shadow-sm 
                         focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400"
            />
          </div>
        </div>

        {/* User Controls */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full w-10 h-10 flex items-center justify-center"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full w-10 h-10 flex items-center justify-center relative" 
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full overflow-hidden w-10 h-10 flex items-center justify-center"
              >
                <Avatar className="h-8 w-8 border-2 border-white dark:border-neutral-800">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=trader" />
                  <AvatarFallback className="bg-primary-500 text-white">
                    {user ? getUserInitials(user.username) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-48 mt-1 p-1">
              <DropdownMenuItem className="rounded-lg cursor-pointer py-2 px-3">
                <UserIcon className="h-4 w-4 mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer py-2 px-3">
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer py-2 px-3 text-red-500" onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;