import { useState } from "react";
import NewsSummary from "./news-summary";
import TopMovers from "./top-movers";
import TradeIdeas from "./trade-ideas";
import MarketSentiment from "./market-sentiment";
import MarketSummary from "./market-summary";
import MarketStatus from "./market-status";
import CalendarEvents from "./calendar-events";
import { useUser } from "@/context/user-context";
import { useMarketData } from "@/hooks/use-market-data";

interface DashboardProps {
  activeView: string;
}

const Dashboard = ({ activeView }: DashboardProps) => {
  const { user } = useUser();
  const { isLoading, marketData } = useMarketData(activeView);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Full width Market Status skeleton */}
        <div className="col-span-1 lg:col-span-3">
          <div className="h-28 ios-card animate-pulse mb-4" />
        </div>

        {/* Full width Market Summary skeleton */}
        <div className="col-span-1 lg:col-span-3">
          <div className="h-24 ios-card animate-pulse" />
        </div>

        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-96 ios-card animate-pulse" /> {/* News */}
          <div className="h-80 ios-card animate-pulse" /> {/* Top Movers */}
          <div className="h-120 ios-card animate-pulse" /> {/* Calendar */}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="h-96 ios-card animate-pulse" /> {/* Trade Ideas */}
          <div className="h-64 ios-card animate-pulse" /> {/* Market Sentiment */}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Full width Market Status greeting */}
      <div className="col-span-1 lg:col-span-3">
        <MarketStatus activeView={activeView} />
      </div>

      {/* Full width Market Summary */}
      <div className="col-span-1 lg:col-span-3">
        <MarketSummary markets={marketData?.marketSummary || []} />
      </div>

      {/* Left Column - News & Market Overview */}
      <div className="lg:col-span-2 space-y-4">
        <NewsSummary news={marketData?.news || []} />
        <TopMovers movers={marketData?.topMovers || []} />
        <CalendarEvents 
          earnings={marketData?.upcomingEarnings || []} 
          dividends={marketData?.dividends || []} 
          economic={marketData?.economicEvents || []}
        />
      </div>

      {/* Right Column - Trade Ideas & Market Sentiment */}
      <div className="space-y-4">
        <TradeIdeas ideas={marketData?.tradeIdeas || []} />
        <MarketSentiment sentiment={marketData?.marketSentiment} />
      </div>
    </div>
  );
};

export default Dashboard;