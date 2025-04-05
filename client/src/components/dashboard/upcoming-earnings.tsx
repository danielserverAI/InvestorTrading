import { Card } from "@/components/ui/card";
import { EarningsEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface UpcomingEarningsProps {
  earnings: EarningsEvent[];
}

const UpcomingEarnings = ({ earnings }: UpcomingEarningsProps) => {
  if (earnings.length === 0) {
    return (
      <Card className="ios-card overflow-hidden mb-4">
        <div className="p-4 pb-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="ios-header">Upcoming Earnings</h2>
            <Button variant="ghost" size="sm" className="text-primary-500 font-medium rounded-full -mr-2">
              Calendar View <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Button>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-neutral-500">No upcoming earnings scheduled.</p>
        </div>
      </Card>
    );
  }

  // Group earnings by week
  const now = new Date();
  const oneWeekLater = new Date(now);
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);

  const thisWeekEarnings = earnings.filter(event => {
    const eventDate = new Date(event.reportDate);
    return eventDate >= now && eventDate < oneWeekLater;
  });

  const nextWeekEarnings = earnings.filter(event => {
    const eventDate = new Date(event.reportDate);
    return eventDate >= oneWeekLater;
  });

  return (
    <Card className="ios-card overflow-hidden mb-4">
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="ios-header">Upcoming Earnings</h2>
          <Button variant="ghost" size="sm" className="text-primary-500 font-medium rounded-full -mr-2">
            Calendar View <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </div>
      </div>
      <div className="px-4 pb-4 space-y-4">
        {/* This Week */}
        {thisWeekEarnings.length > 0 && (
          <div>
            <h4 className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400 mb-3">This Week</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {thisWeekEarnings.map((event, index) => (
                <div 
                  key={index} 
                  className={`p-3 ${getEarningsBorderClass(event.category)} rounded-lg flex items-center`}
                >
                  <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium mr-3">
                    {event.symbol}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{event.name}</div>
                      <div className={`text-xs ${getCategoryTagClass(event.category)} rounded`}>
                        {getCategoryLabel(event.category)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {formatEarningsDate(event.reportDate)} ({event.beforeMarket ? 'Before Open' : 'After Close'})
                      </span>
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">
                        Est. EPS: ${event.estimatedEPS?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Next Week */}
        {nextWeekEarnings.length > 0 && (
          <div>
            <h4 className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400 mb-3">Next Week</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {nextWeekEarnings.map((event, index) => (
                <div 
                  key={index} 
                  className={`p-3 ${getEarningsBorderClass(event.category)} rounded-lg flex items-center`}
                >
                  <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium mr-3">
                    {event.symbol}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{event.name}</div>
                      <div className={`text-xs ${getCategoryTagClass(event.category)} rounded`}>
                        {getCategoryLabel(event.category)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {formatEarningsDate(event.reportDate)} ({event.beforeMarket ? 'Before Open' : 'After Close'})
                      </span>
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">
                        Est. EPS: ${event.estimatedEPS?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* No upcoming earnings */}
        {thisWeekEarnings.length === 0 && nextWeekEarnings.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-sm text-neutral-500">No upcoming earnings events found.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Helper functions
const formatEarningsDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

const getEarningsBorderClass = (category: string): string => {
  switch (category) {
    case 'portfolio':
      return 'border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/20';
    case 'watchlist':
      return 'border border-purple-100 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-900/20';
    case 'interest':
      return 'border border-amber-100 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/20';
    case 'considering':
      return 'border border-green-100 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/20';
    default:
      return 'border border-neutral-200 dark:border-neutral-700';
  }
};

const getCategoryTagClass = (category: string): string => {
  switch (category) {
    case 'portfolio':
      return 'text-blue-700 dark:text-blue-300 font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30';
    case 'watchlist':
      return 'text-purple-700 dark:text-purple-300 font-medium px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30';
    case 'interest':
      return 'text-amber-700 dark:text-amber-300 font-medium px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30';
    case 'considering':
      return 'text-green-700 dark:text-green-300 font-medium px-2 py-0.5 bg-green-100 dark:bg-green-900/30';
    default:
      return 'text-neutral-700 dark:text-neutral-300 font-medium px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700';
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

export default UpcomingEarnings;
