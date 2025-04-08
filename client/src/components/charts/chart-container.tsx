import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TradingViewChart } from './trading-view-chart';
import { cn } from '@/lib/utils';

export interface Stock {
  symbol: string;
  name: string;
  category: 'portfolio' | 'watchlist' | 'liked' | 'worth-considering';
}

interface ChartContainerProps {
  stocks: Stock[];
  initialCategory?: 'portfolio' | 'watchlist' | 'liked' | 'worth-considering';
}

export const ChartContainer = ({ 
  stocks,
  initialCategory = 'portfolio' 
}: ChartContainerProps) => {
  const [currentCategory, setCurrentCategory] = useState(initialCategory);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredStocks = stocks.filter(stock => stock.category === currentCategory);
  const currentStock = filteredStocks[currentIndex];

  const handleNext = () => {
    if (currentIndex < filteredStocks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleCategoryChange = (category: typeof initialCategory) => {
    setCurrentCategory(category);
    setCurrentIndex(0);
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Category Navigation */}
      <div className="mb-4">
        <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-full p-1">
          <button
            onClick={() => handleCategoryChange('portfolio')}
            className={cn(
              'flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              currentCategory === 'portfolio'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            )}
          >
            Portfolio
          </button>
          <button
            onClick={() => handleCategoryChange('watchlist')}
            className={cn(
              'flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              currentCategory === 'watchlist'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            )}
          >
            Watchlist
          </button>
          <button
            onClick={() => handleCategoryChange('liked')}
            className={cn(
              'flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              currentCategory === 'liked'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            )}
          >
            Liked
          </button>
          <button
            onClick={() => handleCategoryChange('worth-considering')}
            className={cn(
              'flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              currentCategory === 'worth-considering'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            )}
          >
            Worth Considering
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative flex-1">
        {currentStock && (
          <TradingViewChart 
            symbol={currentStock.symbol}
            onKeyPointDetected={(point) => console.log('Key point detected:', point)}
          />
        )}
        
        {/* Navigation Buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-neutral-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === filteredStocks.length - 1}
            className="rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-neutral-900"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Stock Info */}
        <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm px-4 py-2 rounded-full">
          <div className="text-sm font-medium">{currentStock?.name}</div>
          <div className="text-xs text-neutral-500">
            {currentIndex + 1} of {filteredStocks.length} in {currentCategory}
          </div>
        </div>
      </div>
    </div>
  );
}; 