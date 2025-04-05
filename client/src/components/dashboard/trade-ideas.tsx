import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TradeIdea } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, LineChart, ArrowUpRight, Check, Sparkles, InfoIcon, Lightbulb } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface TradeIdeasProps {
  ideas: TradeIdea[];
}

const TradeIdeas = ({ ideas }: TradeIdeasProps) => {
  const [horizon, setHorizon] = useState<string>("all");
  const [selectedIdea, setSelectedIdea] = useState<TradeIdea | null>(null);
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
    <>
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
                        <Bookmark className="h-3.5 w-3.5 mr-1.5" />
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
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-primary-500"
                      onClick={() => setSelectedIdea(idea)}
                    >
                      View Details <ArrowUpRight className="h-3 w-3 ml-0.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      {/* Trade Idea Details Dialog */}
      <Dialog open={!!selectedIdea} onOpenChange={(open) => { if (!open) setSelectedIdea(null) }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedIdea && (
            <>
              <DialogHeader>
                <div className="flex items-center mb-2">
                  <div className={`h-12 w-12 rounded-xl ${selectedIdea.priceChangePercent > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'} flex items-center justify-center mr-3`}>
                    <div className="font-bold text-lg">
                      {selectedIdea.symbol}
                    </div>
                  </div>
                  <div>
                    <DialogTitle>{selectedIdea.name}</DialogTitle>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className={`text-sm font-medium ${selectedIdea.priceChangePercent > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        ${selectedIdea.price.toFixed(2)} ({selectedIdea.priceChangePercent > 0 ? '+' : ''}{selectedIdea.priceChangePercent.toFixed(2)}%)
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTimeHorizonTagClass(selectedIdea.timeHorizon)}`}>
                        {getTimeHorizonLabel(selectedIdea.timeHorizon)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getConvictionTagClass(selectedIdea.convictionLevel)}`}>
                        {selectedIdea.convictionLevel === 'high' ? 'High' : selectedIdea.convictionLevel === 'medium' ? 'Medium' : 'Low'} Conviction
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                      Trade Idea Summary
                    </h3>
                    <div className="bg-neutral-50 dark:bg-neutral-900/70 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800">
                      <p className="text-neutral-700 dark:text-neutral-300">{selectedIdea.description}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <LineChart className="h-5 w-5 mr-2 text-primary-500" />
                      Technical Analysis
                    </h3>
                    <div className="bg-neutral-50 dark:bg-neutral-900/70 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800">
                      <div className="h-40 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center mb-3">
                        [Chart placeholder]
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Technical indicators show a potential breakout pattern forming with increasing volume. 
                        Key resistance levels at $152.50 with support at $147.20.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <InfoIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Key Data Points
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-neutral-50 dark:bg-neutral-900/70 rounded-lg p-3 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-xs text-neutral-500 mb-1">Market Cap</div>
                        <div className="font-medium">$287.4B</div>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-900/70 rounded-lg p-3 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-xs text-neutral-500 mb-1">P/E Ratio</div>
                        <div className="font-medium">28.5</div>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-900/70 rounded-lg p-3 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-xs text-neutral-500 mb-1">52-Week Range</div>
                        <div className="font-medium">$126.89 - $164.75</div>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-900/70 rounded-lg p-3 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-xs text-neutral-500 mb-1">Average Volume</div>
                        <div className="font-medium">4.2M</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-emerald-500" />
                      Why Consider This Trade
                    </h3>
                    <div className="bg-neutral-50 dark:bg-neutral-900/70 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800">
                      <ul className="space-y-3">
                        {selectedIdea.reasonsToConsider.map((reason, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-emerald-500 mr-2 mt-0.5">•</span>
                            <span className="text-neutral-700 dark:text-neutral-300">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Potential Risks</h3>
                    <div className="bg-neutral-50 dark:bg-neutral-900/70 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800">
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="text-rose-500 mr-2 mt-0.5">•</span>
                          <span className="text-neutral-700 dark:text-neutral-300">
                            Market volatility could increase if Fed policy changes unexpectedly
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-rose-500 mr-2 mt-0.5">•</span>
                          <span className="text-neutral-700 dark:text-neutral-300">
                            Competition in the sector remains intense with new product launches
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-rose-500 mr-2 mt-0.5">•</span>
                          <span className="text-neutral-700 dark:text-neutral-300">
                            Technical indicators could reverse if volume decreases
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">AI Confidence</h3>
                    <div className="bg-neutral-50 dark:bg-neutral-900/70 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800">
                      <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full ${selectedIdea.convictionLevel === 'high' ? 'bg-emerald-500 w-4/5' : selectedIdea.convictionLevel === 'medium' ? 'bg-amber-500 w-3/5' : 'bg-neutral-500 w-2/5'}`} 
                        />
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {selectedIdea.convictionLevel === 'high' 
                          ? 'Our AI has high confidence in this trade idea based on multiple confirming factors.'
                          : selectedIdea.convictionLevel === 'medium'
                            ? 'Our AI has moderate confidence in this trade idea with some positive signals.' 
                            : 'Our AI has lower confidence in this trade idea, consider additional research.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setSelectedIdea(null)}>
                  Close
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    handleSaveIdea(selectedIdea);
                    setSelectedIdea(null);
                  }}
                  className="rounded-full"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save to Portfolio
                </Button>
                
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Place Trade
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
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
