import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Bell, Settings, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Header = ({ activeView, setActiveView }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useUser();
  const { toast } = useToast();
  
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
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* App Title */}
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <h1 className="ios-header hidden sm:block">Trader's Daily Intel</h1>
        </div>
        
        {/* App Navigation */}
        <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-full p-1">
            <Button 
              variant="ghost"
              onClick={() => setActiveView("morning")}
              className={`rounded-full text-sm px-5 py-1.5 ${activeView === "morning" ? "bg-white dark:bg-neutral-700 shadow-sm" : ""}`}
            >
              Morning
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setActiveView("midday")}
              className={`rounded-full text-sm px-5 py-1.5 ${activeView === "midday" ? "bg-white dark:bg-neutral-700 shadow-sm" : ""}`}
            >
              Midday
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setActiveView("power")}
              className={`rounded-full text-sm px-5 py-1.5 ${activeView === "power" ? "bg-white dark:bg-neutral-700 shadow-sm" : ""}`}
            >
              Power
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setActiveView("after")}
              className={`rounded-full text-sm px-5 py-1.5 ${activeView === "after" ? "bg-white dark:bg-neutral-700 shadow-sm" : ""}`}
            >
              After
            </Button>
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
