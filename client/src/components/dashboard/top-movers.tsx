import { Card } from "@/components/ui/card";
import { AssetMover } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

interface TopMoversProps {
  movers: AssetMover[];
}

// Helper functions
const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  } else {
    return volume.toString();
  }
};

const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1000000000000) {
    return `$${(marketCap / 1000000000000).toFixed(2)}T`;
  } else if (marketCap >= 1000000000) {
    return `$${(marketCap / 1000000000).toFixed(2)}B`;
  } else if (marketCap >= 1000000) {
    return `$${(marketCap / 1000000).toFixed(2)}M`;
  } else {
    return `$${marketCap.toFixed(2)}`;
  }
};

const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'portfolio':
      return 'Your Portfolio';
    case 'watchlist':
      return 'Your Watchlist';
    case 'interest':
      return 'Might Interest You';
    case 'considering':
      return 'Worth Considering';
    default:
      return '';
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'portfolio':
      return 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300';
    case 'watchlist':
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300';
    case 'interest':
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
    case 'considering':
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300';
    default:
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300';
  }
};

const TopMovers = ({ movers }: TopMoversProps) => {
  const [filter, setFilter] = useState<string>("all");
  
  const filteredMovers = filter === "all" 
    ? movers 
    : movers.filter(mover => mover.category === filter);

  if (movers.length === 0) {
    return (
      <Card className="ios-card overflow-hidden mb-4">
        <div className="p-5 text-center">
          <h2 className="ios-header mb-1">Market Movers</h2>
          <p className="text-sm text-neutral-500">No market movers data available.</p>
        </div>
      </Card>
    );
  }

  // Sort by price change percentage (absolute value)
  const sortedMovers = [...filteredMovers].sort((a, b) => 
    Math.abs(b.priceChangePercent) - Math.abs(a.priceChangePercent)
  );

  return (
    <Card className="ios-card overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="ios-header">Market Movers</h2>
          <Button variant="ghost" size="sm" className="text-primary-500 font-medium rounded-full -mr-2">
            See All <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </div>
        
        {/* Filter Tabs - iOS Style */}
        <div className="mb-3 -mx-1 flex overflow-auto no-scrollbar">
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setFilter("all")}
            className={`whitespace-nowrap rounded-full mr-1 px-4 ${
              filter === "all" 
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium" 
                : "text-neutral-500"
            }`}
          >
            All Assets
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setFilter("portfolio")}
            className={`whitespace-nowrap rounded-full mr-1 px-4 ${
              filter === "portfolio" 
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium" 
                : "text-neutral-500"
            }`}
          >
            Your Portfolio
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setFilter("watchlist")}
            className={`whitespace-nowrap rounded-full mr-1 px-4 ${
              filter === "watchlist" 
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium" 
                : "text-neutral-500"
            }`}
          >
            Your Watchlist
          </Button>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <div className="rounded-xl overflow-hidden bg-neutral-50/80 dark:bg-neutral-900/50 backdrop-blur-sm">
          {/* Movers Cards - iOS Style */}
          {sortedMovers.map((mover, index) => {
            const isPositive = mover.priceChangePercent > 0;
            const categoryColor = getCategoryColor(mover.category);
            
            return (
              <div 
                key={index} 
                className={`p-3 flex items-center justify-between ${
                  index !== sortedMovers.length - 1 ? "border-b border-neutral-200 dark:border-neutral-800" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-xl ${isPositive ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'} flex items-center justify-center`}>
                    <div className="font-bold text-sm">
                      {mover.symbol}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-sm">{mover.name}</div>
                    <div className="flex items-center mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor}`}>
                        {getCategoryLabel(mover.category)}
                      </span>
                      
                      {mover.category === 'portfolio' && (
                        <span className="ml-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-full">
                          {formatMarketCap(mover.marketCap)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold">
                    ${mover.price.toFixed(2)}
                  </div>
                  
                  <div className={`flex items-center mt-1 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {isPositive ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    <span className="text-xs font-medium">
                      {isPositive ? '+' : ''}{mover.priceChangePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default TopMovers;
