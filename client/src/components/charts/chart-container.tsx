import { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, MousePointer2, X, 
  CandlestickChart, BarChart3, LineChart, TrendingUp, Activity, 
  ArrowUp, ArrowDown, Circle, Square, Eraser // Add Eraser for delete
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TradingViewChart, MarkerConfig } from './trading-view-chart'; // Import MarkerConfig type
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface Stock {
  symbol: string;
  name: string;
  category: 'portfolio' | 'watchlist' | 'liked' | 'worth-considering';
}

interface ActionConfig extends Omit<Partial<MarkerConfig>, 'icon' | 'id'> { // Make marker parts optional
  id: string; // 'buy', 'sell', 'select', 'delete'
  label: string;
  icon: LucideIcon;
}

// Define action options including select and delete
const actionOptions: ActionConfig[] = [
  { id: 'select', label: 'Select Points', icon: MousePointer2 },
  { id: 'buy', label: 'Buy Signal', icon: ArrowUp, shape: 'arrowUp', color: '#26a69a', position: 'belowBar' },
  { id: 'sell', label: 'Sell Signal', icon: ArrowDown, shape: 'arrowDown', color: '#ef5350', position: 'aboveBar' },
  { id: 'note', label: 'Highlight', icon: Circle, shape: 'circle', color: '#FFA726', position: 'inBar' },
  { id: 'event', label: 'Event', icon: Square, shape: 'square', color: '#a855f7', position: 'aboveBar' },
  { id: 'delete', label: 'Delete Marker', icon: Eraser },
];

interface ChartContainerProps {
  stocks: Stock[];
  initialCategory?: 'portfolio' | 'watchlist';
}

export const ChartContainer = ({ 
  stocks,
  initialCategory = 'portfolio' 
}: ChartContainerProps) => {
  const [currentCategory, setCurrentCategory] = useState(initialCategory);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentInterval, setCurrentInterval] = useState('1D');
  const [chartType, setChartType] = useState<'candles' | 'line' | 'bars' | 'area' | 'baseline'>('candles');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionConfig, setSelectedActionConfig] = useState<ActionConfig>(actionOptions[0]); // Default to Select Points
  const intervals = ['1D', '1W', '1M', '1Y'];

  const filteredStocks = stocks.filter(stock => 
    stock.category === currentCategory && 
    (stock.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const currentStock = filteredStocks[currentIndex];

  const chartTypeIcons = {
    candles: CandlestickChart,
    bars: BarChart3,
    area: TrendingUp,
    baseline: Activity,
    line: LineChart,
  };
  const ChartTypeIcon = chartTypeIcons[chartType];
  const SelectedActionIcon = selectedActionConfig?.icon || MousePointer2; // Default to select icon

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredStocks.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredStocks.length) % filteredStocks.length);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentIndex(0); // Reset index on search
  };

  const toggleCategory = (category: 'portfolio' | 'watchlist') => {
    setCurrentCategory(category);
    setSearchQuery('');
    setCurrentIndex(0);
  };

  return (
    <TooltipProvider> 
      <div className="flex flex-col w-full h-full bg-white dark:bg-neutral-950">
        {/* Top Controls: Category, Search, Navigation */}
        <div className="flex items-center justify-between p-4 border-b dark:border-neutral-800">
          <div className="flex items-center space-x-2">
            <Button 
              variant={currentCategory === 'portfolio' ? "secondary" : "ghost"}
              size="sm"
              onClick={() => toggleCategory('portfolio')}
              className="text-xs sm:text-sm"
            >
              Portfolio
            </Button>
            <Button 
              variant={currentCategory === 'watchlist' ? "secondary" : "ghost"}
              size="sm"
              onClick={() => toggleCategory('watchlist')}
              className="text-xs sm:text-sm"
            >
              Watchlist
            </Button>
          </div>
          <div className="flex-1 max-w-xs mx-4">
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className="h-9 rounded-full bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-1 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600 text-xs sm:text-sm"
            />
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" onClick={handlePrevious} disabled={filteredStocks.length <= 1} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext} disabled={filteredStocks.length <= 1} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Main Content: Chart and Controls */}
        <div className="flex-1 flex flex-col p-2 sm:p-4 overflow-hidden">
          {/* Chart Controls Bar */}
          <div className="flex items-center justify-between mb-2 sm:mb-4 flex-wrap gap-2">
            {/* Left Controls: Interval, Type */}
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <div className="flex space-x-1 bg-neutral-100 dark:bg-neutral-800 rounded-full p-1">
                {intervals.map((interval) => (
                  <button
                    key={interval}
                    onClick={() => setCurrentInterval(interval)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                      currentInterval === interval
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                    )}
                  >
                    {interval}
                  </button>
                ))}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 p-0 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full"
                      >
                        <ChartTypeIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="start"
                      className="w-[180px] bg-neutral-50/90 dark:bg-neutral-900/90 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl shadow-lg"
                    >
                      {/* Chart Type Items */}
                      {(Object.keys(chartTypeIcons) as Array<keyof typeof chartTypeIcons>).map((type) => {
                        const Icon = chartTypeIcons[type];
                        return (
                          <DropdownMenuItem 
                            key={type}
                            onClick={() => setChartType(type)}
                            className={cn(
                              'flex items-center gap-2 py-2 px-3 text-sm cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800/70 rounded-md',
                              chartType === type && 'bg-neutral-100/70 dark:bg-neutral-800/50'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="flex-1 capitalize">{type}</span>
                            {chartType === type && <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent sideOffset={5} className="text-xs">
                  <p>Chart Type</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Right Controls: Action Selector Dropdown */}
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 p-0 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full"
                        title={`Current Action: ${selectedActionConfig.label}`}
                      >
                        <SelectedActionIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end"
                      className="w-[180px] bg-neutral-50/90 dark:bg-neutral-900/90 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl shadow-lg"
                    >
                      {actionOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <DropdownMenuItem 
                            key={option.id}
                            onClick={() => setSelectedActionConfig(option)}
                            className={cn(
                              'flex items-center gap-2 py-2 px-3 text-sm cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800/70 rounded-md',
                              selectedActionConfig?.id === option.id && 'bg-neutral-100/70 dark:bg-neutral-800/50'
                            )}
                          >
                            <Icon className="h-4 w-4" style={{ color: option.color }}/> 
                            <span className="flex-1 capitalize">{option.label}</span>
                            {selectedActionConfig?.id === option.id && <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent sideOffset={5} className="text-xs">
                  <p>Select Click Action</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Chart Area */}
          <div className="relative flex-1 min-h-[300px] sm:min-h-[400px]">
            {currentStock ? (
              <TradingViewChart 
                key={`${currentStock.symbol}-${currentInterval}`}
                symbol={currentStock.symbol}
                interval={currentInterval}
                selectedActionConfig={selectedActionConfig}
                chartType={chartType}
                onKeyPointDetected={(point) => console.log('Key point selected:', point)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-500">
                {stocks.length === 0 ? 'No stocks available' : 'Select or search for a stock'}
              </div>
            )}
          </div>
        </div>
        
        {/* Stock Details Footer (Optional) */}
        {currentStock && (
          <div className="p-4 border-t dark:border-neutral-800 text-center">
            <h3 className="text-lg font-semibold">{currentStock.name} ({currentStock.symbol})</h3>
            {/* Add more details if needed */}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}; 