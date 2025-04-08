import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/context/user-context";
import { useMarketData } from "@/hooks/use-market-data";
import { useCurrentView } from "@/hooks/use-current-view";
import Header from "@/components/layout/header";
import MarketStatus from "@/components/dashboard/market-status";
import MarketSummary from "@/components/dashboard/market-summary";
import NewsSummary from "@/components/dashboard/news-summary";
import TopMovers from "@/components/dashboard/top-movers";
import TradeIdeas from "@/components/dashboard/trade-ideas";
import MarketSentiment from "@/components/dashboard/market-sentiment";
import CalendarEvents from "@/components/dashboard/calendar-events";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { ChartContainer } from "@/components/charts/chart-container";
import { ChatContainer } from "@/components/chat/ChatContainer";
import type { Stock } from "@/components/charts/chart-container";

// Mock data for testing - Replace with real data later
const mockStocks = [
  { symbol: "AAPL", name: "Apple Inc.", category: "portfolio" },
  { symbol: "MSFT", name: "Microsoft Corp.", category: "portfolio" },
  { symbol: "GOOGL", name: "Alphabet Inc.", category: "watchlist" },
  { symbol: "AMZN", name: "Amazon.com Inc.", category: "liked" },
  { symbol: "NVDA", name: "NVIDIA Corp.", category: "worth-considering" },
] as Stock[];

const Home = () => {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { activeView, setActiveView } = useCurrentView();
  const { isLoading, marketData } = useMarketData(activeView);

  useEffect(() => {
    if (!user) {
      setLocation("/onboarding");
    }
  }, [user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
        <Header activeView={activeView} setActiveView={setActiveView} />
        <main className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Loading states */}
            <div className="col-span-1 lg:col-span-12">
              <div className="h-28 animate-pulse rounded-3xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md shadow-sm mb-4" />
            </div>
            <div className="col-span-1 lg:col-span-12">
              <div className="h-24 animate-pulse rounded-3xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md shadow-sm" />
            </div>
          </div>
        </main>
        <MobileNavigation activeView={activeView} setActiveView={setActiveView} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
      <Header activeView={activeView} setActiveView={setActiveView} />
      <main className="container mx-auto px-4 py-4">
        {/* Market Status and Summary */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="rounded-3xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md shadow-sm p-4 border border-white/20 dark:border-neutral-700/20">
            <MarketStatus activeView={activeView} />
          </div>
          <div className="rounded-3xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md shadow-sm p-4 border border-white/20 dark:border-neutral-700/20">
            <MarketSummary markets={marketData?.marketSummary || []} />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Chart Section - Left Side */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md shadow-sm p-4 border border-white/20 dark:border-neutral-700/20">
              <ChartContainer stocks={mockStocks} />
            </div>
          </div>

          {/* Chat Interface - Right Side */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md shadow-sm h-[600px] overflow-hidden border border-white/20 dark:border-neutral-700/20">
              <ChatContainer />
            </div>
          </div>
        </div>
      </main>
      <MobileNavigation activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default Home;
