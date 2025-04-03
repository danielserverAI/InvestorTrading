import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Bell, ChevronDown } from "lucide-react";
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
    <header className="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <h1 className="text-xl font-semibold hidden sm:block">Trader's Daily Intel</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex space-x-1">
            <Button 
              variant={activeView === "morning" ? "default" : "ghost"}
              onClick={() => setActiveView("morning")}
              className="py-2 px-3 text-sm"
            >
              Morning Brief
            </Button>
            <Button 
              variant={activeView === "midday" ? "default" : "ghost"}
              onClick={() => setActiveView("midday")}
              className="py-2 px-3 text-sm"
            >
              Midday Pulse
            </Button>
            <Button 
              variant={activeView === "power" ? "default" : "ghost"}
              onClick={() => setActiveView("power")}
              className="py-2 px-3 text-sm"
            >
              Power Hour
            </Button>
            <Button 
              variant={activeView === "after" ? "default" : "ghost"}
              onClick={() => setActiveView("after")}
              className="py-2 px-3 text-sm"
            >
              After Hours
            </Button>
          </nav>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary-500"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>{user ? getUserInitials(user.username) : "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
