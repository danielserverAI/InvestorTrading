import { useState, useMemo } from 'react';
import { format, isSameDay, addDays, isAfter, isBefore } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, ArrowRightIcon, TrendingUpIcon, DollarSignIcon, BarChart3Icon, BuildingIcon, LandmarkIcon, GlobeIcon } from 'lucide-react';
import { EarningsEvent, DividendEvent, EconomicEvent } from '@/lib/types';

interface CalendarEventsProps {
  earnings: EarningsEvent[];
  dividends: DividendEvent[];
  economic?: EconomicEvent[];
}

type EventType = 'earnings' | 'ex-dividend' | 'payment' | 'economic' | 'fed' | 'treasury' | 'geopolitical';

interface CalendarEvent {
  date: Date;
  symbol: string;
  name: string;
  type: EventType;
  category: string;
  details?: {
    estimatedEPS?: number;
    beforeMarket?: boolean;
    amount?: number;
    importance?: string;
    description?: string;
    previousValue?: number;
    forecast?: number;
  };
}

const CalendarEvents = ({ earnings, dividends, economic = [] }: CalendarEventsProps) => {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Convert earnings and dividends to unified calendar events
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Add earnings events
    earnings.forEach(earning => {
      // Convert string date to Date object
      const reportDate = new Date(earning.reportDate);

      events.push({
        date: reportDate,
        symbol: earning.symbol,
        name: earning.name,
        type: 'earnings',
        category: earning.category,
        details: {
          estimatedEPS: earning.estimatedEPS,
          beforeMarket: earning.beforeMarket
        }
      });
    });

    // Add dividend ex-dates
    dividends.forEach(dividend => {
      if (dividend.exDividendDate) {
        const exDate = new Date(dividend.exDividendDate);

        events.push({
          date: exDate,
          symbol: dividend.symbol,
          name: dividend.name,
          type: 'ex-dividend',
          category: dividend.category,
          details: {
            amount: dividend.amount
          }
        });
      }

      // Add dividend payment dates
      if (dividend.paymentDate) {
        const paymentDate = new Date(dividend.paymentDate);

        events.push({
          date: paymentDate,
          symbol: dividend.symbol,
          name: dividend.name,
          type: 'payment',
          category: dividend.category,
          details: {
            amount: dividend.amount
          }
        });
      }
    });

    // Sort events by date
    // Add economic events
    economic.forEach(event => {
      const eventDate = new Date(event.date);

      events.push({
        date: eventDate,
        symbol: event.category.toUpperCase(),
        name: event.title,
        type: event.category as EventType,
        category: 'economic',
        details: {
          importance: event.importance,
          description: event.description,
          previousValue: event.previousValue,
          forecast: event.forecast
        }
      });
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [earnings, dividends, economic]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const twoWeeksFromNow = addDays(today, 14);

    const relevantEvents = activeTab === 'upcoming' 
      ? calendarEvents.filter(event => 
          !isBefore(event.date, today) && !isAfter(event.date, twoWeeksFromNow))
      : calendarEvents;

    relevantEvents.forEach(event => {
      const dateKey = format(event.date, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }, [calendarEvents, activeTab]);

  // Helper functions
  const formatDate = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = addDays(today, 1);

    if (isSameDay(date, today)) {
      return 'Today';
    } else if (isSameDay(date, tomorrow)) {
      return 'Tomorrow';
    } else {
      return format(date, 'EEE, MMM d');
    }
  };

  const formatFullDate = (date: Date): string => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const getEventBadgeClass = (type: EventType): string => {
    switch (type) {
      case 'earnings':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'ex-dividend':
        return 'bg-emerald-500 hover:bg-emerald-600';
      case 'payment':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'economic':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'fed':
        return 'bg-red-500 hover:bg-red-600';
      case 'treasury':
        return 'bg-cyan-500 hover:bg-cyan-600';
      case 'geopolitical':
        return 'bg-orange-500 hover:bg-orange-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const formatEventType = (type: EventType): string => {
    switch (type) {
      case 'earnings':
        return 'Earnings';
      case 'ex-dividend':
        return 'Ex-Dividend';
      case 'payment':
        return 'Dividend Payment';
      default:
        return type;
    }
  };

  const getCategoryClass = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'portfolio':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'watchlist':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'considering':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'interest':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'earnings':
        return <TrendingUpIcon className="h-4 w-4 mr-1" />;
      case 'ex-dividend':
        return <CalendarIcon className="h-4 w-4 mr-1" />;
      case 'payment':
        return <DollarSignIcon className="h-4 w-4 mr-1" />;
      case 'economic':
        return <BarChart3Icon className="h-4 w-4 mr-1" />;
      case 'fed':
        return <BuildingIcon className="h-4 w-4 mr-1" />;
      case 'treasury':
        return <LandmarkIcon className="h-4 w-4 mr-1" />;
      case 'geopolitical':
        return <GlobeIcon className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Card className="ios-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Financial Calendar</CardTitle>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[240px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="all">All Events</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <CardDescription>
          Upcoming earnings reports and dividend dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {Object.entries(eventsByDate).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(eventsByDate).map(([dateKey, events]) => {
              const date = new Date(dateKey);
              return (
                <div key={dateKey} className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {formatDate(date)}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      {formatFullDate(date)}
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {events.map((event, idx) => (
                      <div key={`${event.symbol}-${event.type}-${idx}`} 
                        className="w-full rounded-xl overflow-hidden bg-white/90 dark:bg-neutral-700/95 border-transparent shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-semibold text-lg">{event.symbol}</div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400">{event.name}</div>
                            </div>
                            <div className="flex gap-1">
                              <Badge className={`flex items-center ${getEventBadgeClass(event.type)}`}>
                                {getEventIcon(event.type)}
                                {formatEventType(event.type)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex justify-between items-end">
                            {event.type === 'earnings' && (
                              <div className="font-bold text-xl">
                                ${event.details?.estimatedEPS?.toFixed(2)}
                                <span className="text-xs text-neutral-500 ml-1">Est. EPS</span>
                              </div>
                            )}
                            {(event.type === 'ex-dividend' || event.type === 'payment') && (
                              <div className="font-bold text-xl">
                                ${event.details?.amount?.toFixed(2)}
                                <span className="text-xs text-neutral-500 ml-1">Dividend</span>
                              </div>
                            )}
                            <Badge variant="secondary" className={getCategoryClass(event.category)}>
                              {event.category === 'interest' ? 'Might Interest You' :
                               event.category === 'portfolio' ? 'Your Portfolio' :
                               event.category === 'watchlist' ? 'Your Watchlist' :
                               event.category === 'considering' ? 'Worth Considering' :
                               event.category}
                            </Badge>
                          </div>

                          {event.type === 'earnings' && (
                            <div className="mt-1 text-sm text-muted-foreground">
                              {event.details?.estimatedEPS ? (
                                <span>Est. EPS: ${event.details.estimatedEPS.toFixed(2)}</span>
                              ) : (
                                <span>No EPS estimate available</span>
                              )}
                            </div>
                          )}

                          {(event.type === 'ex-dividend' || event.type === 'payment') && (
                            <div className="mt-1 text-sm text-muted-foreground">
                              {event.details?.amount ? (
                                <span>Amount: ${event.details.amount.toFixed(2)}</span>
                              ) : (
                                <span>Amount not available</span>
                              )}
                            </div>
                          )}
                          {event.type === 'economic' && (
                            <div className="mt-1 text-sm text-muted-foreground">
                              {event.details?.description ? (
                                <span>Description: {event.details.description}</span>
                              ) : (
                                <span>No description available</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No events found for the selected period
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarEvents;