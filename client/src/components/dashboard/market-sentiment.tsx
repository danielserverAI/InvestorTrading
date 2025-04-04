import { Card } from "@/components/ui/card";
import { MarketSentimentData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronRight, ActivitySquare, LineChart, BarChart2, PieChart } from "lucide-react";

interface MarketSentimentProps {
  sentiment?: MarketSentimentData;
}

// Helper functions for Fear & Greed Index
const getFearGreedLabel = (value: number): string => {
  if (value <= 25) return 'Extreme Fear';
  if (value <= 40) return 'Fear';
  if (value <= 60) return 'Neutral';
  if (value <= 75) return 'Greed';
  return 'Extreme Greed';
};

const getFearGreedClass = (value: number): string => {
  if (value <= 25) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  if (value <= 40) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
  if (value <= 60) return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300';
  if (value <= 75) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
  return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
};

const getFearGreedBarColor = (value: number): string => {
  if (value <= 25) return 'bg-red-500';
  if (value <= 40) return 'bg-amber-500';
  if (value <= 60) return 'bg-neutral-500';
  if (value <= 75) return 'bg-amber-500';
  return 'bg-emerald-500';
};

// Helper functions for Put/Call Ratio
const getPutCallLabel = (value: number): string => {
  if (value <= 0.7) return 'Bullish';
  if (value <= 0.9) return 'Neutral';
  return 'Bearish';
};

const getPutCallClass = (value: number): string => {
  if (value <= 0.7) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
  if (value <= 0.9) return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300';
  return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
};

const getPutCallBarColor = (value: number): string => {
  if (value <= 0.7) return 'bg-emerald-500';
  if (value <= 0.9) return 'bg-neutral-500';
  return 'bg-red-500';
};

const getPutCallPercentage = (value: number): number => {
  // Convert put/call ratio to a percentage for display (0.5 to 1.5 range maps to 0-100%)
  return Math.min(100, Math.max(0, ((value - 0.5) / 1) * 100));
};

// Helper functions for VIX
const getVixLabel = (value: number): string => {
  if (value <= 15) return 'Low';
  if (value <= 25) return 'Moderate';
  return 'High';
};

const getVixClass = (value: number): string => {
  if (value <= 15) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
  if (value <= 25) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
  return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
};

const getVixBarColor = (value: number): string => {
  if (value <= 15) return 'bg-emerald-500';
  if (value <= 25) return 'bg-amber-500';
  return 'bg-red-500';
};

const getVixPercentage = (value: number): number => {
  // Map VIX from 0-50 to 0-100%
  return Math.min(100, Math.max(0, (value / 50) * 100));
};

// Helper functions for Bullish Sentiment
const getBullishLabel = (value: number): string => {
  if (value <= 30) return 'Below Avg';
  if (value <= 45) return 'Average';
  if (value <= 60) return 'Above Avg';
  return 'Elevated';
};

const getBullishClass = (value: number): string => {
  if (value <= 30) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  if (value <= 45) return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300';
  if (value <= 60) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
  return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
};

const getBullishBarColor = (value: number): string => {
  if (value <= 30) return 'bg-red-500';
  if (value <= 45) return 'bg-neutral-500';
  if (value <= 60) return 'bg-amber-500';
  return 'bg-emerald-500';
};

const MarketSentiment = ({ sentiment }: MarketSentimentProps) => {
  if (!sentiment) {
    return (
      <Card className="ios-card overflow-hidden mb-4">
        <div className="p-5 text-center">
          <h2 className="ios-header mb-1">Market Sentiment</h2>
          <p className="text-sm text-neutral-500">Market sentiment data unavailable.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="ios-card overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="ios-header">Market Sentiment</h2>
          <Button variant="ghost" size="sm" className="text-primary-500 font-medium rounded-full -mr-2">
            Details <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-1">
          {/* Fear & Greed Card */}
          <div className="rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
            <div className="bg-opacity-50 backdrop-blur-sm p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center">
                  <ActivitySquare className="h-4 w-4 text-neutral-500 mr-2" />
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Fear & Greed</span>
                </div>
              </div>
              
              <div className="mt-1 flex items-center mb-1.5">
                <div className="text-2xl font-bold mr-2">{sentiment.fearGreedIndex}</div>
                <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${getFearGreedClass(sentiment.fearGreedIndex)}`}>
                  {getFearGreedLabel(sentiment.fearGreedIndex)}
                </div>
              </div>
              
              <div className="bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`${getFearGreedBarColor(sentiment.fearGreedIndex)} h-full`} 
                  style={{ width: `${sentiment.fearGreedIndex}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Put/Call Ratio Card */}
          <div className="rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
            <div className="bg-opacity-50 backdrop-blur-sm p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center">
                  <LineChart className="h-4 w-4 text-neutral-500 mr-2" />
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Put/Call Ratio</span>
                </div>
              </div>
              
              <div className="mt-1 flex items-center mb-1.5">
                <div className="text-2xl font-bold mr-2">{sentiment.putCallRatio.toFixed(2)}</div>
                <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPutCallClass(sentiment.putCallRatio)}`}>
                  {getPutCallLabel(sentiment.putCallRatio)}
                </div>
              </div>
              
              <div className="bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`${getPutCallBarColor(sentiment.putCallRatio)} h-full`} 
                  style={{ width: `${getPutCallPercentage(sentiment.putCallRatio)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* VIX Card */}
          <div className="rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
            <div className="bg-opacity-50 backdrop-blur-sm p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center">
                  <BarChart2 className="h-4 w-4 text-neutral-500 mr-2" />
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">VIX (Volatility)</span>
                </div>
              </div>
              
              <div className="mt-1 flex items-center mb-1.5">
                <div className="text-2xl font-bold mr-2">{sentiment.vix.toFixed(2)}</div>
                <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${getVixClass(sentiment.vix)}`}>
                  {getVixLabel(sentiment.vix)}
                </div>
              </div>
              
              <div className="bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`${getVixBarColor(sentiment.vix)} h-full`} 
                  style={{ width: `${getVixPercentage(sentiment.vix)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Bullish Sentiment Card */}
          <div className="rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
            <div className="bg-opacity-50 backdrop-blur-sm p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center">
                  <PieChart className="h-4 w-4 text-neutral-500 mr-2" />
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Bullish Sentiment</span>
                </div>
              </div>
              
              <div className="mt-1 flex items-center mb-1.5">
                <div className="text-2xl font-bold mr-2">{sentiment.bullishSentiment.toFixed(0)}%</div>
                <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${getBullishClass(sentiment.bullishSentiment)}`}>
                  {getBullishLabel(sentiment.bullishSentiment)}
                </div>
              </div>
              
              <div className="bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`${getBullishBarColor(sentiment.bullishSentiment)} h-full`} 
                  style={{ width: `${sentiment.bullishSentiment}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-neutral-500 text-center mt-2">
          Data updated: {new Date(sentiment.date).toLocaleString()}
        </div>
      </div>
    </Card>
  );
};

export default MarketSentiment;