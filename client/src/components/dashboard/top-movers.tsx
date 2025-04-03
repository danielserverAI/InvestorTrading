import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AssetMover } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TopMoversProps {
  movers: AssetMover[];
}

const TopMovers = ({ movers }: TopMoversProps) => {
  const [filter, setFilter] = useState<string>("all");
  
  const filteredMovers = filter === "all" 
    ? movers 
    : movers.filter(mover => mover.category === filter);

  if (movers.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-md font-medium">Top Movers</CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
            <Button size="sm" variant={filter === "portfolio" ? "default" : "outline"} onClick={() => setFilter("portfolio")}>Portfolio</Button>
            <Button size="sm" variant={filter === "watchlist" ? "default" : "outline"} onClick={() => setFilter("watchlist")}>Watchlist</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <p className="text-sm text-neutral-500">No market movers data available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-md font-medium">Top Movers</CardTitle>
        <div className="flex space-x-2">
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
          <Button size="sm" variant={filter === "portfolio" ? "default" : "outline"} onClick={() => setFilter("portfolio")}>Portfolio</Button>
          <Button size="sm" variant={filter === "watchlist" ? "default" : "outline"} onClick={() => setFilter("watchlist")}>Watchlist</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="text-left py-2 px-4 font-medium">Symbol</th>
                <th className="text-right py-2 px-4 font-medium">Price</th>
                <th className="text-right py-2 px-4 font-medium">Change</th>
                <th className="text-right py-2 px-4 font-medium">% Change</th>
                <th className="text-right py-2 px-4 font-medium">Volume</th>
                <th className="text-right py-2 px-4 font-medium">Market Cap</th>
                <th className="text-right py-2 px-4 font-medium">Chart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredMovers.map((mover, index) => {
                const isPositive = mover.priceChangePercent > 0;
                const rowBgClass = getRowBackgroundClass(mover.category);
                
                return (
                  <tr key={index} className={rowBgClass}>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-7 w-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium mr-2">
                          {mover.symbol}
                        </div>
                        <div>
                          <div className="font-medium">{mover.name}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">{getCategoryLabel(mover.category)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums">${mover.price.toFixed(2)}</td>
                    <td className={`py-3 px-4 text-right tabular-nums ${isPositive ? 'text-success-500' : 'text-danger-500'}`}>
                      {isPositive ? '+' : ''}{mover.priceChange.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 text-right tabular-nums ${isPositive ? 'text-success-500' : 'text-danger-500'}`}>
                      {isPositive ? '+' : ''}{mover.priceChangePercent.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums">{formatVolume(mover.volume)}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{formatMarketCap(mover.marketCap)}</td>
                    <td className="py-3 px-4">
                      <div className={`mini-chart h-8 w-24 ${isPositive ? 'bg-success-500/10' : 'bg-danger-500/10'} rounded relative overflow-hidden ml-auto`}>
                        <div className={`absolute bottom-0 left-0 right-0 h-1/2 border-t ${isPositive ? 'border-success-500/50' : 'border-danger-500/50'}`}></div>
                        {/* Simplified chart visualization */}
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`absolute bottom-0 left-[${i * 20}%] h-${3 + Math.floor(Math.random() * 6)} w-1 ${isPositive ? 'bg-success-500/30' : 'bg-danger-500/30'}`}
                          ></div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

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

const getRowBackgroundClass = (category: string): string => {
  switch (category) {
    case 'portfolio':
      return 'bg-blue-50/30 dark:bg-blue-900/10';
    case 'watchlist':
      return 'bg-neutral-50/50 dark:bg-neutral-900/20';
    default:
      return '';
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

export default TopMovers;
