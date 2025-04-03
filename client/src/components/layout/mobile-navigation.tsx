import { Home, Clock, TrendingUp, MoonStar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavigationProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const MobileNavigation = ({ activeView, setActiveView }: MobileNavigationProps) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 z-50">
      <div className="flex justify-around py-2">
        <Button
          variant="ghost"
          className={`flex flex-col items-center p-2 ${activeView === "morning" ? "text-primary-500" : "text-neutral-500"}`}
          onClick={() => setActiveView("morning")}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Morning</span>
        </Button>
        <Button
          variant="ghost"
          className={`flex flex-col items-center p-2 ${activeView === "midday" ? "text-primary-500" : "text-neutral-500"}`}
          onClick={() => setActiveView("midday")}
        >
          <Clock className="h-5 w-5" />
          <span className="text-xs mt-1">Midday</span>
        </Button>
        <Button
          variant="ghost"
          className={`flex flex-col items-center p-2 ${activeView === "power" ? "text-primary-500" : "text-neutral-500"}`}
          onClick={() => setActiveView("power")}
        >
          <TrendingUp className="h-5 w-5" />
          <span className="text-xs mt-1">Power</span>
        </Button>
        <Button
          variant="ghost"
          className={`flex flex-col items-center p-2 ${activeView === "after" ? "text-primary-500" : "text-neutral-500"}`}
          onClick={() => setActiveView("after")}
        >
          <MoonStar className="h-5 w-5" />
          <span className="text-xs mt-1">After</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileNavigation;
