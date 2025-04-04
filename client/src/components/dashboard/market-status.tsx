
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useUser } from "@/context/user-context";
import { Clock } from "lucide-react";

interface MarketStatusProps {
  activeView: string;
}

const MarketStatus = ({ activeView }: MarketStatusProps) => {
  const { user } = useUser();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [marketStatus, setMarketStatus] = useState<string>("");
  const [timeToEvent, setTimeToEvent] = useState<string>("");

  // Update the clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Calculate market status and time remaining
  useEffect(() => {
    const calculateMarketStatus = () => {
      const now = currentTime;
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const day = now.getDay();

      // Weekend
      if (day === 0 || day === 6) {
        setMarketStatus("closed");

        // Calculate time to market open on Monday
        const daysToMonday = day === 0 ? 1 : 2;
        const nextMarketOpen = new Date(now);
        nextMarketOpen.setDate(now.getDate() + daysToMonday);
        nextMarketOpen.setHours(9, 30, 0, 0);

        const diffMs = nextMarketOpen.getTime() - now.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        setTimeToEvent(`${diffHrs}h ${diffMins}m until market opens`);
        return;
      }

      // Pre-market (4:00 AM - 9:30 AM)
      if ((hours < 9) || (hours === 9 && minutes < 30)) {
        setMarketStatus("pre-market");

        const marketOpen = new Date(now);
        marketOpen.setHours(9, 30, 0, 0);

        const diffMs = marketOpen.getTime() - now.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        setTimeToEvent(`${diffHrs}h ${diffMins}m until market opens`);
        return;
      }

      // Regular market hours (9:30 AM - 4:00 PM)
      if ((hours < 16) || (hours === 16 && minutes === 0)) {
        setMarketStatus("open");

        // If approaching close (within 30 min)
        if ((hours === 15 && minutes >= 30) || hours === 16) {
          const marketClose = new Date(now);
          marketClose.setHours(16, 0, 0, 0);

          const diffMs = marketClose.getTime() - now.getTime();
          const diffMins = Math.floor(diffMs / (1000 * 60));

          setTimeToEvent(`${diffMins}m until market closes`);
        } else {
          const marketClose = new Date(now);
          marketClose.setHours(16, 0, 0, 0);

          const diffMs = marketClose.getTime() - now.getTime();
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

          setTimeToEvent(`${diffHrs}h ${diffMins}m until market closes`);
        }
        return;
      }

      // After-hours (4:00 PM - 8:00 PM)
      if (hours < 20) {
        setMarketStatus("after-hours");

        const afterHoursClose = new Date(now);
        afterHoursClose.setHours(20, 0, 0, 0);

        const diffMs = afterHoursClose.getTime() - now.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        setTimeToEvent(`${diffHrs}h ${diffMins}m until after-hours trading ends`);
        return;
      }

      // Closed (8:00 PM - 4:00 AM)
      setMarketStatus("closed");

      // Calculate time to next pre-market
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);

      // If it's Friday night, next market is Monday
      if (day === 5) {
        tomorrow.setDate(now.getDate() + 3);
      }

      tomorrow.setHours(4, 0, 0, 0);

      const diffMs = tomorrow.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      setTimeToEvent(`${diffHrs}h ${diffMins}m until pre-market trading begins`);
    };

    calculateMarketStatus();
  }, [currentTime]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hours = currentTime.getHours();

    if (hours < 12) {
      return "Good morning";
    } else if (hours < 17) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  // Get view title based on activeView
  const getViewTitle = () => {
    switch (activeView) {
      case "morning":
        return "Morning Brief";
      case "midday":
        return "Midday Pulse";
      case "power":
        return "Power Hour";
      case "after":
        return "After Hours";
      default:
        return "Daily Brief";
    }
  };

  // Determine status color
  const getStatusColor = () => {
    switch (marketStatus) {
      case "open":
        return "text-emerald-600 dark:text-emerald-400";
      case "closed":
        return "text-rose-600 dark:text-rose-400";
      case "pre-market":
      case "after-hours":
        return "text-amber-600 dark:text-amber-400";
      default:
        return "text-neutral-600 dark:text-neutral-400";
    }
  };

  // Format the market status text
  const formatMarketStatus = () => {
    switch (marketStatus) {
      case "open":
        return "Market Open";
      case "closed":
        return "Market Closed";
      case "pre-market":
        return "Pre-Market Trading";
      case "after-hours":
        return "After-Hours Trading";
      default:
        return "Market Status Unknown";
    }
  };

  const today = currentTime.toLocaleDateString(undefined, { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Card className="ios-card mb-4">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{getViewTitle()}</h1>
              <span className="text-sm text-muted-foreground">{today}</span>
            </div>
          </div>
          <div className="space-y-1 text-right">
            <div className={`bg-destructive/10 text-destructive py-1 px-3 rounded-full inline-flex items-center text-sm font-medium ${getStatusColor()}`}>
              <Clock className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> 
              {formatMarketStatus()}
            </div>
            <div className="text-sm text-muted-foreground">
              {timeToEvent}
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t">
          <div className="text-2xl font-semibold tracking-tight">
            {getGreeting()}{user ? `, ${user.username}` : ""}
          </div>
          <p className="text-sm text-muted-foreground">
            Here's your personalized market intelligence brief for today
          </p>
        </div>
      </div>
    </Card>
  );
};

export default MarketStatus;
