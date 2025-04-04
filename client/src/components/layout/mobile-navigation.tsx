import { Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavigationProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const MobileNavigation = ({ activeView, setActiveView }: MobileNavigationProps) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 z-50 px-4 pb-6 pt-2">
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full p-1.5 flex justify-between">
        <Button
          variant="ghost"
          className={`flex flex-col items-center rounded-full flex-1 pt-2 pb-1 ${
            activeView === "morning" 
              ? "bg-white dark:bg-neutral-700 shadow-sm text-primary-500 dark:text-primary-400" 
              : "text-neutral-500"
          }`}
          onClick={() => setActiveView("morning")}
        >
          <Sunrise className="h-5 w-5" />
          <span className="text-xs mt-0.5 font-medium">Morning</span>
        </Button>
        <Button
          variant="ghost"
          className={`flex flex-col items-center rounded-full flex-1 pt-2 pb-1 ${
            activeView === "midday" 
              ? "bg-white dark:bg-neutral-700 shadow-sm text-primary-500 dark:text-primary-400" 
              : "text-neutral-500"
          }`}
          onClick={() => setActiveView("midday")}
        >
          <Sun className="h-5 w-5" />
          <span className="text-xs mt-0.5 font-medium">Midday</span>
        </Button>
        <Button
          variant="ghost"
          className={`flex flex-col items-center rounded-full flex-1 pt-2 pb-1 ${
            activeView === "power" 
              ? "bg-white dark:bg-neutral-700 shadow-sm text-primary-500 dark:text-primary-400" 
              : "text-neutral-500"
          }`}
          onClick={() => setActiveView("power")}
        >
          <Sunset className="h-5 w-5" />
          <span className="text-xs mt-0.5 font-medium">Power</span>
        </Button>
        <Button
          variant="ghost"
          className={`flex flex-col items-center rounded-full flex-1 pt-2 pb-1 ${
            activeView === "after" 
              ? "bg-white dark:bg-neutral-700 shadow-sm text-primary-500 dark:text-primary-400" 
              : "text-neutral-500"
          }`}
          onClick={() => setActiveView("after")}
        >
          <Moon className="h-5 w-5" />
          <span className="text-xs mt-0.5 font-medium">After</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileNavigation;
