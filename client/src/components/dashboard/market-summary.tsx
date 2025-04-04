import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MarketSummaryData } from "@/lib/types";

interface MarketSummaryProps {
  markets: MarketSummaryData[];
}

const MarketSummary = ({ markets }: MarketSummaryProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  if (!markets || markets.length === 0) {
    return (
      <Card className="ios-card overflow-hidden mb-4">
        <div className="p-5 text-center">
          <h2 className="ios-header mb-1">Market Summary</h2>
          <p className="text-sm text-neutral-500">No market data available.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="ios-card overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="ios-header">Market Summary</h2>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-8 w-8 bg-neutral-100 dark:bg-neutral-800"
              onClick={scrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-8 w-8 bg-neutral-100 dark:bg-neutral-800"
              onClick={scrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div 
          ref={sliderRef}
          className="flex overflow-x-auto space-x-3 pb-1 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {markets.map((market, index) => {
            const isPositive = market.change > 0;
            const colorClass = isPositive 
              ? "text-emerald-600 dark:text-emerald-400" 
              : "text-rose-600 dark:text-rose-400";
            
            const bgClass = isPositive 
              ? "bg-emerald-50 dark:bg-emerald-900/20" 
              : "bg-rose-50 dark:bg-rose-900/20";
            
            return (
              <div 
                key={index} 
                className="flex-shrink-0 w-[250px] rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-lg">{market.name}</div>
                      <div className="text-xs text-neutral-500">{market.symbol}</div>
                    </div>
                    <div className={`px-2 py-1 rounded-lg ${bgClass}`}>
                      <div className={`font-medium text-xs ${colorClass}`}>
                        {isPositive ? '+' : ''}{market.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="font-bold text-2xl">
                      {formatPrice(market.price)}
                    </div>
                    <div className={`flex items-center ${colorClass}`}>
                      <span className="text-sm font-medium">
                        {isPositive ? '+' : ''}{market.change.toFixed(2)}
                      </span>
                    </div>
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

// Helper function to format price based on value
const formatPrice = (price: number): string => {
  if (price >= 1000) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    return `$${price.toFixed(2)}`;
  }
};

export default MarketSummary;