import { useEffect, useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      setLocation("/onboarding");
    }
  }, [user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
        <Header activeView={activeView} setActiveView={setActiveView} onSearchChange={setSearchQuery} />
        <main className="flex-1 flex flex-col container mx-auto px-4 py-4 overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
      <Header activeView={activeView} setActiveView={setActiveView} onSearchChange={setSearchQuery} />
      <main className="flex-1 flex flex-col container mx-auto px-2 py-2 overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
        {/* Market Status and Summary - Removed/Commented out */}
        {/*
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="rounded-3xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md shadow-sm p-4 border border-white/20 dark:border-neutral-700/20">
            <MarketStatus activeView={activeView} />
          </div>
          <div className="rounded-3xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md shadow-sm p-4 border border-white/20 dark:border-neutral-700/20">
            <MarketSummary markets={marketData?.marketSummary || []} />
          </div>
        </div>
        */}

        {/* Grid with Constrained Top Row Height */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 grid-rows-[minmax(0,_70vh)_auto]"> {/* Increased max height to 70vh */} 
          
          {/* Row 1: Chart & Chat (Max 70vh) */}
          {/* Chart Section */}
          <div className="lg:col-span-8 h-full"> {/* Added h-full back */} 
            <div className="rounded-3xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md shadow-sm p-4 border border-white/20 dark:border-neutral-700/20 h-full"> {/* Removed max-h, Added h-full back */} 
              <ChartContainer stocks={mockStocks} searchQuery={searchQuery} />
            </div>
          </div>
          {/* Chat Interface */}
          <div className="lg:col-span-4 h-full"> {/* Added h-full back */} 
            <div className="rounded-3xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md shadow-sm h-full overflow-hidden border border-white/20 dark:border-neutral-700/20"> {/* Removed max-h, Added h-full back */} 
              <ChatContainer />
            </div>
          </div>

          {/* Row 2: Dashboard Components (Auto Height) */}
          <div className="lg:col-span-12 mt-4"> {/* Spans full width, appears in second row */} 
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Column 1: Market Movers & News */}
              <div className="space-y-4">
                <div className="rounded-3xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md shadow-sm p-4 border border-white/20 dark:border-neutral-700/20">
                  <TopMovers movers={marketData?.topMovers || []} />
                </div>
                <div className="rounded-3xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md shadow-sm p-4 border border-white/20 dark:border-neutral-700/20">
                  <NewsSummary news={marketData?.news || []} />
                </div>
              </div>

              {/* Column 2: Insights & Watchlist (Using Placeholders) */}
              <div className="space-y-4">
                 <div className="rounded-3xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md shadow-sm p-4 border border-white/20 dark:border-neutral-700/20">
                  {/* Placeholder for Insights - Using TradeIdeas */} 
                   <TradeIdeas ideas={marketData?.tradeIdeas || []} />
                 </div>
                 <div className="rounded-3xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md shadow-sm p-4 border border-white/20 dark:border-neutral-700/20">
                   {/* Placeholder for Smart Watchlist - Using MarketSentiment */} 
                   <MarketSentiment sentiment={marketData?.marketSentiment} />
                 </div>
              </div>

              {/* Column 3: Calendar */}
              <div className="space-y-4">
                <div className="rounded-3xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md shadow-sm p-4 border border-white/20 dark:border-neutral-700/20">
                  {/* Placeholder for second Insights - Maybe duplicate TradeIdeas or leave empty? */} 
                  {/* For now, just placing CalendarEvents */} 
                  <CalendarEvents 
                    earnings={marketData?.upcomingEarnings || []} 
                    dividends={marketData?.dividends || []} 
                    economic={marketData?.economicEvents || []}
                  />
                </div>
                 {/* Add another component here if needed based on image */} 
              </div>

            </div>
          </div>

        </div>
      </main>
      <MobileNavigation activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default Home;
