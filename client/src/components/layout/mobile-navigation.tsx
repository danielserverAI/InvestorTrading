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
          className={`flex flex-col items-center rounded-full flex-1 py-1.5 ${
            activeView === "morning" 
              ? "bg-white dark:bg-neutral-700 shadow-sm text-primary-500 dark:text-primary-400" 
              : "text-neutral-500"
          }`}
          onClick={() => setActiveView("morning")}
        >
          <div className="flex flex-col items-center -space-y-0.5">
            <Sunrise className="h-5 w-5" />
            <span className="text-xs font-medium">Morning</span>
          </div>
        </Button>
        <Button
          variant="ghost"
          className={`flex flex-col items-center rounded-full flex-1 py-1.5 ${
            activeView === "midday" 
              ? "bg-white dark:bg-neutral-700 shadow-sm text-primary-500 dark:text-primary-400" 
              : "text-neutral-500"
          }`}
          onClick={() => setActiveView("midday")}
        >
          <div className="flex flex-col items-center -space-y-0.5">
            <Sun className="h-5 w-5" />
            <span className="text-xs font-medium">Midday</span>
          </div>
        </Button>
        <Button
          variant="ghost"
          className={`flex flex-col items-center rounded-full flex-1 py-1.5 ${
            activeView === "power" 
              ? "bg-white dark:bg-neutral-700 shadow-sm text-primary-500 dark:text-primary-400" 
              : "text-neutral-500"
          }`}
          onClick={() => setActiveView("power")}
        >
          <div className="flex flex-col items-center -space-y-0.5">
            <Sunset className="h-5 w-5" />
            <span className="text-xs font-medium">Power</span>
          </div>
        </Button>
        <Button
          variant="ghost"
          className={`flex flex-col items-center rounded-full flex-1 py-1.5 ${
            activeView === "after" 
              ? "bg-white dark:bg-neutral-700 shadow-sm text-primary-500 dark:text-primary-400" 
              : "text-neutral-500"
          }`}
          onClick={() => setActiveView("after")}
        >
          <div className="flex flex-col items-center -space-y-0.5">
            <Moon className="h-5 w-5" />
            <span className="text-xs font-medium">After</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default MobileNavigation;
