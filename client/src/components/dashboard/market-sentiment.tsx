import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MarketSentimentData } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface MarketSentimentProps {
  sentiment?: MarketSentimentData;
}

const MarketSentiment = ({ sentiment }: MarketSentimentProps) => {
  if (!sentiment) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-md font-medium">Market Sentiment</CardTitle>
          <Button variant="link" size="sm">Details</Button>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <p className="text-sm text-neutral-500">Market sentiment data unavailable.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-md font-medium">Market Sentiment</CardTitle>
        <Button variant="link" size="sm">Details</Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">Fear & Greed Index</div>
            <div className="mt-1 flex items-center">
              <div className="text-xl font-semibold mr-2">{sentiment.fearGreedIndex}</div>
              <div className={`text-sm px-2 py-0.5 ${getFearGreedClass(sentiment.fearGreedIndex)} rounded font-medium`}>
                {getFearGreedLabel(sentiment.fearGreedIndex)}
              </div>
            </div>
            <div className="mt-2 bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
              <div className={`${getFearGreedBarColor(sentiment.fearGreedIndex)} h-full`} style={{ width: `${sentiment.fearGreedIndex}%` }}></div>
            </div>
          </div>
          
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">Put/Call Ratio</div>
            <div className="mt-1 flex items-center">
              <div className="text-xl font-semibold mr-2">{sentiment.putCallRatio.toFixed(2)}</div>
              <div className={`text-sm px-2 py-0.5 ${getPutCallClass(sentiment.putCallRatio)} rounded font-medium`}>
                {getPutCallLabel(sentiment.putCallRatio)}
              </div>
            </div>
            <div className="mt-2 bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
              <div className={`${getPutCallBarColor(sentiment.putCallRatio)} h-full`} style={{ width: `${getPutCallPercentage(sentiment.putCallRatio)}%` }}></div>
            </div>
          </div>
          
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">VIX (Volatility)</div>
            <div className="mt-1 flex items-center">
              <div className="text-xl font-semibold mr-2">{sentiment.vix.toFixed(2)}</div>
              <div className={`text-sm px-2 py-0.5 ${getVixClass(sentiment.vix)} rounded font-medium`}>
                {getVixLabel(sentiment.vix)}
              </div>
            </div>
            <div className="mt-2 bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
              <div className={`${getVixBarColor(sentiment.vix)} h-full`} style={{ width: `${getVixPercentage(sentiment.vix)}%` }}></div>
            </div>
          </div>
          
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">Bullish Sentiment</div>
            <div className="mt-1 flex items-center">
              <div className="text-xl font-semibold mr-2">{sentiment.bullishSentiment.toFixed(0)}%</div>
              <div className={`text-sm px-2 py-0.5 ${getBullishClass(sentiment.bullishSentiment)} rounded font-medium`}>
                {getBullishLabel(sentiment.bullishSentiment)}
              </div>
            </div>
            <div className="mt-2 bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
              <div className={`${getBullishBarColor(sentiment.bullishSentiment)} h-full`} style={{ width: `${sentiment.bullishSentiment}%` }}></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper functions for Fear & Greed Index
const getFearGreedLabel = (value: number): string => {
  if (value <= 25) return 'Extreme Fear';
  if (value <= 40) return 'Fear';
  if (value <= 60) return 'Neutral';
  if (value <= 75) return 'Greed';
  return 'Extreme Greed';
};

const getFearGreedClass = (value: number): string => {
  if (value <= 25) return 'bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300';
  if (value <= 40) return 'bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300';
  if (value <= 60) return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300';
  if (value <= 75) return 'bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300';
  return 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300';
};

const getFearGreedBarColor = (value: number): string => {
  if (value <= 25) return 'bg-danger-500';
  if (value <= 40) return 'bg-warning-500';
  if (value <= 60) return 'bg-neutral-500';
  if (value <= 75) return 'bg-warning-500';
  return 'bg-success-500';
};

// Helper functions for Put/Call Ratio
const getPutCallLabel = (value: number): string => {
  if (value <= 0.7) return 'Bullish';
  if (value <= 0.9) return 'Neutral';
  return 'Bearish';
};

const getPutCallClass = (value: number): string => {
  if (value <= 0.7) return 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300';
  if (value <= 0.9) return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300';
  return 'bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300';
};

const getPutCallBarColor = (value: number): string => {
  if (value <= 0.7) return 'bg-success-500';
  if (value <= 0.9) return 'bg-neutral-500';
  return 'bg-danger-500';
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
  if (value <= 15) return 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300';
  if (value <= 25) return 'bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300';
  return 'bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300';
};

const getVixBarColor = (value: number): string => {
  if (value <= 15) return 'bg-success-500';
  if (value <= 25) return 'bg-warning-500';
  return 'bg-danger-500';
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
  if (value <= 30) return 'bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300';
  if (value <= 45) return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300';
  if (value <= 60) return 'bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300';
  return 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300';
};

const getBullishBarColor = (value: number): string => {
  if (value <= 30) return 'bg-danger-500';
  if (value <= 45) return 'bg-neutral-500';
  if (value <= 60) return 'bg-warning-500';
  return 'bg-success-500';
};

export default MarketSentiment;
