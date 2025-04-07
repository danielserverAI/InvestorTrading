import { useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import MobileNavigation from "@/components/layout/mobile-navigation";
import Dashboard from "@/components/dashboard/index";
import { useUser } from "@/context/user-context";
import { useCurrentView } from "@/hooks/use-current-view";

const Home = () => {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useUser();
  const { activeView, setActiveView } = useCurrentView();

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
        <Dashboard activeView={activeView} />
      </main>
      
      <MobileNavigation activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default Home;
