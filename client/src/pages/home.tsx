import { useEffect, useState, useRef } from "react";
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
import { ChartContainer } from "@/components/charts/chart-container";
import { ChatContainer } from "@/components/chat/ChatContainer";
import type { Stock } from "@/components/charts/chart-container";
import type { ChartHandle } from "@/components/charts/trading-view-chart";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

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
  const chartRef = useRef<ChartHandle>(null);

  useEffect(() => {
    if (!user) {
      setLocation("/onboarding");
    }
  }, [user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-neutral-50 dark:from-black dark:to-neutral-950">
        <Header activeView={activeView} setActiveView={setActiveView} onSearchChange={setSearchQuery} />
        <main className="flex-1 flex flex-col container mx-auto px-4 py-4 overflow-y-auto" style={{ minHeight: 'calc(100vh - 4rem)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Loading states - Apply darker card style */}
            <div className="col-span-1 lg:col-span-12">
              <div className="h-28 animate-pulse rounded-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-sm mb-4 border border-white/20 dark:border-neutral-800/50" />
            </div>
            <div className="col-span-1 lg:col-span-12">
              <div className="h-24 animate-pulse rounded-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-sm border border-white/20 dark:border-neutral-800/50" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-neutral-50 dark:from-black dark:to-neutral-950">
      <Header activeView={activeView} setActiveView={setActiveView} onSearchChange={setSearchQuery} />
      <main className="flex-1 flex flex-col container mx-auto px-2 py-2 overflow-y-auto" style={{ minHeight: 'calc(100vh - 4rem)' }}>
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
            <div className="rounded-3xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-sm p-4 border border-white/20 dark:border-neutral-800/50 h-full"> {/* Removed max-h, Added h-full back */} 
              <ChartContainer ref={chartRef} stocks={mockStocks} searchQuery={searchQuery} />
            </div>
          </div>
          {/* Desktop Chat Interface (Hidden on mobile/medium) */}
          <div className="hidden lg:block lg:col-span-4 h-full"> {/* Changed md:block to lg:block */}
            <div className="rounded-3xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-sm h-full border border-white/20 dark:border-neutral-800/50 flex"> 
              <ChatContainer chartRef={chartRef} />
            </div>
          </div>

          {/* Row 2: Dashboard Components (New Structure) */}
          {/* News Summary below Chart */}
          <div className="lg:col-span-8 mt-4"> 
            <div className="rounded-3xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-sm p-4 border border-white/20 dark:border-neutral-800/50">
              <NewsSummary news={marketData?.news || []} />
            </div>
          </div>

          {/* Stacked Components (Movers, Calendar, Sentiment) below Chat */}
          <div className="lg:col-span-4 mt-4 space-y-4"> 
            {/* Market Movers */}
            <div className="rounded-3xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-sm p-4 border border-white/20 dark:border-neutral-800/50">
              <TopMovers movers={marketData?.topMovers || []} />
            </div>
            
            {/* Financial Calendar */}
            <div className="rounded-3xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-sm p-4 border border-white/20 dark:border-neutral-800/50">
              <CalendarEvents 
                earnings={marketData?.upcomingEarnings || []} 
                dividends={marketData?.dividends || []} 
                economic={marketData?.economicEvents || []}
              />
            </div>

            {/* Market Sentiment */}
            <div className="rounded-3xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-sm p-4 border border-white/20 dark:border-neutral-800/50">
              <MarketSentiment sentiment={marketData?.marketSentiment} />
            </div>

            {/* TradeIdeas is hidden for now - can be added back here later */}
            {/* <div className="rounded-3xl ... ">
              <TradeIdeas ideas={marketData?.tradeIdeas || []} />
            </div> */}
          </div>

        </div>
      </main>
      
      {/* Mobile Chat Drawer (Hidden on large screens) */}
      <div className="block lg:hidden"> {/* Changed md:hidden to lg:hidden */} 
        <Drawer.Root shouldScaleBackground>
          <Drawer.Trigger asChild>
            <Button
              variant="default"
              size="icon"
              className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100"
              aria-label="Open Chat"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[55]" />
            <Drawer.Content className="bg-neutral-100 dark:bg-neutral-950 flex flex-col rounded-t-[10px] h-[90%] mt-24 fixed bottom-0 left-0 right-0 z-[60]">
              <div className="p-4 bg-neutral-100 dark:bg-neutral-950 rounded-t-[10px] h-full flex flex-col min-h-0">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-700 mb-4" />
                <ChatContainer chartRef={chartRef} />
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </div>
  );
};

export default Home;
