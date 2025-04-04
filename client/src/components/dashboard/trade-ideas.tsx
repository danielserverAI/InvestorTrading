import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TradeIdea } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface TradeIdeasProps {
  ideas: TradeIdea[];
}

const TradeIdeas = ({ ideas }: TradeIdeasProps) => {
  const [horizon, setHorizon] = useState<string>("all");
  const { toast } = useToast();
  
  const filteredIdeas = horizon === "all" 
    ? ideas 
    : ideas.filter(idea => idea.timeHorizon === horizon);

  const handleSaveIdea = (idea: TradeIdea) => {
    toast({
      title: "Idea Saved",
      description: `You saved the idea for ${idea.symbol}.`,
    });
  };

  const handleDismissIdea = (idea: TradeIdea) => {
    toast({
      title: "Idea Dismissed",
      description: `You dismissed the idea for ${idea.symbol}.`,
    });
  };

  if (ideas.length === 0) {
    return (
      <Card className="ios-card overflow-hidden mb-4">
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="ios-header">AI-Powered Trade Ideas</h2>
            <Select value={horizon} onValueChange={setHorizon}>
              <SelectTrigger className="w-[180px] rounded-full text-sm">
                <SelectValue placeholder="All Time Horizons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time Horizons</SelectItem>
                <SelectItem value="intraday">Intraday</SelectItem>
                <SelectItem value="swing">Swing Trade</SelectItem>
                <SelectItem value="long-term">Long-Term</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-neutral-500">No trade ideas available right now.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="ios-card overflow-hidden mb-4">
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="ios-header">AI-Powered Trade Ideas</h2>
          <Select value={horizon} onValueChange={setHorizon}>
            <SelectTrigger className="w-[180px] rounded-full text-sm">
              <SelectValue placeholder="All Time Horizons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time Horizons</SelectItem>
              <SelectItem value="intraday">Intraday</SelectItem>
              <SelectItem value="swing">Swing Trade</SelectItem>
              <SelectItem value="long-term">Long-Term</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="px-0">
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {filteredIdeas.map((idea, index) => (
            <div key={index} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium mr-3">
                    {idea.symbol}
                  </div>
                  <div>
                    <div className="font-medium">{idea.name}</div>
                    <div className={`text-sm ${idea.priceChangePercent >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
                      ${idea.price.toFixed(2)} ({idea.priceChangePercent >= 0 ? '+' : ''}{idea.priceChangePercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-0.5 ${getTimeHorizonTagClass(idea.timeHorizon)} rounded-full font-medium`}>
                    {getTimeHorizonLabel(idea.timeHorizon)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 ${getConvictionTagClass(idea.convictionLevel)} rounded-full font-medium`}>
                    {idea.convictionLevel === 'high' ? 'High' : idea.convictionLevel === 'medium' ? 'Medium' : 'Low'} Conviction
                  </span>
                </div>
              </div>
              
              <div className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
                <p>{idea.description}</p>
                
                <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-md text-sm">
                  <h5 className="font-medium text-neutral-800 dark:text-neutral-200 mb-1">Why Suggested:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-600 dark:text-neutral-400">
                    {idea.reasonsToConsider.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-3 flex justify-between">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleSaveIdea(idea)}
                      className="rounded-full"
                    >
                      Save Idea
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDismissIdea(idea)}
                      className="rounded-full"
                    >
                      Dismiss
                    </Button>
                  </div>
                  <Button variant="link" size="sm" className="text-primary-500">View Details</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Helper functions
const getTimeHorizonTagClass = (horizon: string): string => {
  switch (horizon) {
    case 'intraday':
      return 'bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300';
    case 'swing':
      return 'bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300';
    case 'long-term':
      return 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300';
    default:
      return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300';
  }
};

const getConvictionTagClass = (conviction: string): string => {
  switch (conviction) {
    case 'high':
      return 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300';
    case 'medium':
      return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300';
    case 'low':
      return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300';
    default:
      return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300';
  }
};

const getTimeHorizonLabel = (horizon: string): string => {
  switch (horizon) {
    case 'intraday':
      return 'Intraday';
    case 'swing':
      return 'Swing Trade';
    case 'long-term':
      return 'Long-Term';
    default:
      return horizon;
  }
};

export default TradeIdeas;
