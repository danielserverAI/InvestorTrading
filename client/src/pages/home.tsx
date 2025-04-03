import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import MobileNavigation from "@/components/layout/mobile-navigation";
import Dashboard from "@/components/dashboard/index";
import { useUser } from "@/context/user-context";

const Home = () => {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useUser();
  const [activeView, setActiveView] = useState("morning");

  useEffect(() => {
    // If user is not logged in and not loading, redirect to onboarding
    if (!isLoading && !user) {
      setLocation("/onboarding");
    }
  }, [user, isLoading, setLocation]);

  // Views based on time of day
  const views = {
    morning: "Morning Brief",
    midday: "Midday Pulse",
    power: "Power Hour",
    after: "After Hours"
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse h-10 w-10 bg-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col dark:bg-neutral-900">
      <Header activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 container mx-auto px-4 pb-16 md:pb-8 pt-4">
        {/* Date & Market Status Bar */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
          <div>
            <h2 className="text-lg font-medium">{views[activeView as keyof typeof views]}</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <div className="flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-success-500 mr-2"></span>
              <span className="text-sm">Markets Open in 32m</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex flex-col items-end">
                <span className="font-medium">S&P 500</span>
                <span className="text-sm text-success-500">+0.42%</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-medium">NASDAQ</span>
                <span className="text-sm text-success-500">+0.56%</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-medium">VIX</span>
                <span className="text-sm text-danger-500">-3.17%</span>
              </div>
            </div>
          </div>
        </div>

        <Dashboard activeView={activeView} />
      </main>
      
      <MobileNavigation activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default Home;
