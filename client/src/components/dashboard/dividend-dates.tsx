import { Card } from "@/components/ui/card";
import { DividendEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface DividendDatesProps {
  dividends: DividendEvent[];
}

const DividendDates = ({ dividends }: DividendDatesProps) => {
  if (dividends.length === 0) {
    return (
      <Card className="ios-card overflow-hidden mb-4">
        <div className="p-4 pb-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="ios-header">Upcoming Dividend Dates</h2>
            <Button variant="ghost" size="sm" className="text-primary-500 font-medium rounded-full -mr-2">
              View All <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Button>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-neutral-500">No upcoming dividend dates found.</p>
        </div>
      </Card>
    );
  }

  // Separate dividends by type
  const exDividends = dividends.filter(d => d.exDividendDate && new Date(d.exDividendDate) >= new Date());
  const paymentDividends = dividends.filter(d => d.paymentDate && new Date(d.paymentDate) >= new Date());

  return (
    <Card className="ios-card overflow-hidden mb-4">
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="ios-header">Upcoming Dividend Dates</h2>
          <Button variant="ghost" size="sm" className="text-primary-500 font-medium rounded-full -mr-2">
            View All <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {/* Ex-Dividend Section */}
          {exDividends.length > 0 && (
            <div className="py-4">
              <h4 className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400 mb-3">Ex-Dividend Date</h4>
              
              <div className="space-y-3">
                {exDividends.map((dividend, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center p-3 ${getDividendBorderClass(dividend.category)} rounded-lg`}
                  >
                    <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium mr-3">
                      {dividend.symbol}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="font-medium">{dividend.name}</div>
                        <div className={`text-xs ${getCategoryTagClass(dividend.category)} rounded-full`}>
                          {getCategoryLabel(dividend.category)}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {formatDate(dividend.exDividendDate || "")}
                        </span>
                        <span className="font-medium tabular-nums">${dividend.amount.toFixed(2)} per share</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Payment Date Section */}
          {paymentDividends.length > 0 && (
            <div className="py-4">
              <h4 className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400 mb-3">Payment Date</h4>
              
              <div className="space-y-3">
                {paymentDividends.map((dividend, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center p-3 ${getDividendBorderClass(dividend.category)} rounded-lg`}
                  >
                    <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium mr-3">
                      {dividend.symbol}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="font-medium">{dividend.name}</div>
                        <div className={`text-xs ${getCategoryTagClass(dividend.category)} rounded-full`}>
                          {getCategoryLabel(dividend.category)}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {formatDate(dividend.paymentDate || "")}
                        </span>
                        <span className="font-medium tabular-nums">${dividend.amount.toFixed(2)} per share</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Helper functions
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const getDividendBorderClass = (category: string): string => {
  switch (category) {
    case 'portfolio':
      return 'border border-primary-100 dark:border-primary-900/30 bg-primary-50/50 dark:bg-primary-900/20';
    case 'watchlist':
      return 'border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50';
    default:
      return 'border border-neutral-200 dark:border-neutral-700';
  }
};

const getCategoryTagClass = (category: string): string => {
  switch (category) {
    case 'portfolio':
      return 'text-primary-500 font-medium px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30';
    default:
      return 'text-neutral-500 font-medium px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700';
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

export default DividendDates;
