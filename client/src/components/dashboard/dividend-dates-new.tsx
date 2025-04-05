import { Card } from "@/components/ui/card";
import { DividendEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";

// Helper functions
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatDateWithWeekday = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

const getDividendBorderClass = (category: string): string => {
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

interface DividendDatesProps {
  dividends: DividendEvent[];
}

const DividendDatesNew = ({ dividends }: DividendDatesProps) => {
  const [calendarView, setCalendarView] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  if (dividends.length === 0) {
    return (
      <Card className="ios-card overflow-hidden mb-4">
        <div className="p-4 pb-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="ios-header">Upcoming Dividend Dates</h2>
            <Button variant="ghost" size="sm" className="text-primary-500 font-medium rounded-full -mr-2">
              Calendar <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
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
  const now = new Date();
  const exDividends = dividends.filter(d => d.exDividendDate && new Date(d.exDividendDate) >= now);
  const paymentDividends = dividends.filter(d => d.paymentDate && new Date(d.paymentDate) >= now);

  // Group dividends by week for calendar view
  const oneWeekLater = new Date(now);
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);
  const twoWeeksLater = new Date(now);
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

  const thisWeekExDivs = exDividends.filter(d => {
    const date = new Date(d.exDividendDate || "");
    return date >= now && date < oneWeekLater;
  });

  const nextWeekExDivs = exDividends.filter(d => {
    const date = new Date(d.exDividendDate || "");
    return date >= oneWeekLater && date < twoWeeksLater;
  });

  const laterExDivs = exDividends.filter(d => {
    const date = new Date(d.exDividendDate || "");
    return date >= twoWeeksLater;
  });

  const thisWeekPaymentDivs = paymentDividends.filter(d => {
    const date = new Date(d.paymentDate || "");
    return date >= now && date < oneWeekLater;
  });

  const nextWeekPaymentDivs = paymentDividends.filter(d => {
    const date = new Date(d.paymentDate || "");
    return date >= oneWeekLater && date < twoWeeksLater;
  });

  const laterPaymentDivs = paymentDividends.filter(d => {
    const date = new Date(d.paymentDate || "");
    return date >= twoWeeksLater;
  });

  // Find dividends for the selected date
  const dividendsOnSelectedDate = dividends.filter(d => {
    if (!date) return false;
    
    const exDate = d.exDividendDate ? new Date(d.exDividendDate) : null;
    const payDate = d.paymentDate ? new Date(d.paymentDate) : null;
    
    const isSameDate = (d1: Date, d2: Date) => {
      return d1.getFullYear() === d2.getFullYear() && 
             d1.getMonth() === d2.getMonth() && 
             d1.getDate() === d2.getDate();
    };
    
    return (exDate && isSameDate(exDate, date)) || (payDate && isSameDate(payDate, date));
  });

  // Calendar highlighting function
  const getDividendDaysHighlight = () => {
    const highlightDays: Record<string, any> = {};
    
    dividends.forEach(dividend => {
      if (dividend.exDividendDate) {
        const date = new Date(dividend.exDividendDate);
        const dateKey = date.toISOString().split('T')[0];
        highlightDays[dateKey] = {
          className: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-100',
          styles: {
            fontWeight: 'bold'
          }
        };
      }
      
      if (dividend.paymentDate) {
        const date = new Date(dividend.paymentDate);
        const dateKey = date.toISOString().split('T')[0];
        highlightDays[dateKey] = {
          className: 'bg-green-100 hover:bg-green-200 dark:bg-green-900/40 dark:hover:bg-green-900/60 text-green-800 dark:text-green-100',
          styles: {
            fontWeight: 'bold'
          }
        };
      }
    });
    
    return highlightDays;
  };

  return (
    <>
      <Card className="ios-card overflow-hidden mb-4">
        <div className="p-4 pb-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="ios-header">Upcoming Dividend Dates</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary-500 font-medium rounded-full -mr-2"
              onClick={() => setCalendarView(true)}
            >
              Calendar <CalendarIcon className="h-3.5 w-3.5 ml-0.5" />
            </Button>
          </div>
        </div>
        <Tabs defaultValue="exdividend" className="w-full">
          <div className="px-4">
            <TabsList className="grid w-full grid-cols-2 mb-2 border dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
              <TabsTrigger value="exdividend" className="text-xs font-medium">Ex-Dividend</TabsTrigger>
              <TabsTrigger value="payment" className="text-xs font-medium">Payment</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="exdividend" className="p-0">
            <div className="px-4 pb-4 space-y-4">
              {/* This Week */}
              {thisWeekExDivs.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400 mb-3">This Week</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {thisWeekExDivs.map((dividend, index) => (
                      <div 
                        key={index} 
                        className={`p-3 ${getDividendBorderClass(dividend.category)} rounded-lg flex items-center`}
                      >
                        <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium mr-3">
                          {dividend.symbol}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{dividend.name}</div>
                            <div className={`text-xs ${getCategoryTagClass(dividend.category)} rounded-full`}>
                              {getCategoryLabel(dividend.category)}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                              {formatDateWithWeekday(dividend.exDividendDate || "")}
                            </span>
                            <span className="font-medium tabular-nums">${dividend.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Next Week */}
              {nextWeekExDivs.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400 mb-3">Next Week</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {nextWeekExDivs.map((dividend, index) => (
                      <div 
                        key={index} 
                        className={`p-3 ${getDividendBorderClass(dividend.category)} rounded-lg flex items-center`}
                      >
                        <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium mr-3">
                          {dividend.symbol}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{dividend.name}</div>
                            <div className={`text-xs ${getCategoryTagClass(dividend.category)} rounded-full`}>
                              {getCategoryLabel(dividend.category)}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                              {formatDateWithWeekday(dividend.exDividendDate || "")}
                            </span>
                            <span className="font-medium tabular-nums">${dividend.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Later */}
              {laterExDivs.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400 mb-3">Later</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {laterExDivs.map((dividend, index) => (
                      <div 
                        key={index} 
                        className={`p-3 ${getDividendBorderClass(dividend.category)} rounded-lg flex items-center`}
                      >
                        <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium mr-3">
                          {dividend.symbol}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{dividend.name}</div>
                            <div className={`text-xs ${getCategoryTagClass(dividend.category)} rounded-full`}>
                              {getCategoryLabel(dividend.category)}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                              {formatDate(dividend.exDividendDate || "")}
                            </span>
                            <span className="font-medium tabular-nums">${dividend.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* No upcoming ex-dividend dates */}
              {thisWeekExDivs.length === 0 && nextWeekExDivs.length === 0 && laterExDivs.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-sm text-neutral-500">No upcoming ex-dividend dates found.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="payment" className="p-0">
            <div className="px-4 pb-4 space-y-4">
              {/* This Week */}
              {thisWeekPaymentDivs.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400 mb-3">This Week</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {thisWeekPaymentDivs.map((dividend, index) => (
                      <div 
                        key={index} 
                        className={`p-3 ${getDividendBorderClass(dividend.category)} rounded-lg flex items-center`}
                      >
                        <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium mr-3">
                          {dividend.symbol}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{dividend.name}</div>
                            <div className={`text-xs ${getCategoryTagClass(dividend.category)} rounded-full`}>
                              {getCategoryLabel(dividend.category)}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                              {formatDateWithWeekday(dividend.paymentDate || "")}
                            </span>
                            <span className="font-medium tabular-nums">${dividend.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Next Week */}
              {nextWeekPaymentDivs.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400 mb-3">Next Week</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {nextWeekPaymentDivs.map((dividend, index) => (
                      <div 
                        key={index} 
                        className={`p-3 ${getDividendBorderClass(dividend.category)} rounded-lg flex items-center`}
                      >
                        <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium mr-3">
                          {dividend.symbol}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{dividend.name}</div>
                            <div className={`text-xs ${getCategoryTagClass(dividend.category)} rounded-full`}>
                              {getCategoryLabel(dividend.category)}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                              {formatDateWithWeekday(dividend.paymentDate || "")}
                            </span>
                            <span className="font-medium tabular-nums">${dividend.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Later */}
              {laterPaymentDivs.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400 mb-3">Later</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {laterPaymentDivs.map((dividend, index) => (
                      <div 
                        key={index} 
                        className={`p-3 ${getDividendBorderClass(dividend.category)} rounded-lg flex items-center`}
                      >
                        <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium mr-3">
                          {dividend.symbol}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{dividend.name}</div>
                            <div className={`text-xs ${getCategoryTagClass(dividend.category)} rounded-full`}>
                              {getCategoryLabel(dividend.category)}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                              {formatDate(dividend.paymentDate || "")}
                            </span>
                            <span className="font-medium tabular-nums">${dividend.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* No upcoming payment dates */}
              {thisWeekPaymentDivs.length === 0 && nextWeekPaymentDivs.length === 0 && laterPaymentDivs.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-sm text-neutral-500">No upcoming payment dates found.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
      
      {/* Calendar View Modal */}
      <Dialog open={calendarView} onOpenChange={setCalendarView}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dividend Calendar</DialogTitle>
          </DialogHeader>
          <div className="pt-2 pb-4">
            <div className="flex flex-col space-y-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="border rounded-lg p-3"
                modifiers={{
                  dividend: Object.keys(getDividendDaysHighlight()).map(dateStr => new Date(dateStr))
                }}
                modifiersStyles={{
                  dividend: { backgroundColor: "#E6F2FF", fontWeight: "bold" }
                }}
              />
              
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{date ? formatDate(date.toISOString()) : 'Select a date'}</h3>
                </div>
                
                {date && dividendsOnSelectedDate.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {dividendsOnSelectedDate.map((div, index) => (
                      <div key={index} className={`p-3 ${getDividendBorderClass(div.category)} rounded-lg`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="text-sm font-medium">{div.symbol}</div>
                            <div className="ml-2 text-sm">{div.name}</div>
                          </div>
                          <div className="font-medium">${div.amount.toFixed(2)}</div>
                        </div>
                        <div className="mt-1 text-sm">
                          {div.exDividendDate && new Date(div.exDividendDate).toISOString().split('T')[0] === date.toISOString().split('T')[0] && (
                            <span className="text-blue-600 dark:text-blue-400">Ex-Dividend Date</span>
                          )}
                          {div.paymentDate && new Date(div.paymentDate).toISOString().split('T')[0] === date.toISOString().split('T')[0] && (
                            <span className="text-green-600 dark:text-green-400">Payment Date</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 text-center text-sm text-neutral-500">
                    {date ? 'No dividends on this date' : 'Select a date to see dividends'}
                  </div>
                )}
                
                <div className="mt-4 flex items-center text-xs">
                  <div className="mr-4 flex items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-400 mr-1"></div>
                    <span>Ex-Dividend Date</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-400 mr-1"></div>
                    <span>Payment Date</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DividendDatesNew;