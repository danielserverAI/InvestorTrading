// User types
export interface User {
  id: number;
  username: string;
  email: string;
  tradingExperience: string;
  tradingStyles: string[];
  tradingGoals: string[];
  interestTags: string[];
}

// Asset types
export interface Asset {
  id: number;
  symbol: string;
  name: string;
  type: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  marketCap: number;
}

export interface AssetMover extends Asset {
  category: string; // portfolio, watchlist, interest, considering
}

// News types
export interface News {
  id: number;
  title: string;
  content: string;
  source: string;
  url: string;
  publishedAt: string;
  category: string; // macro, portfolio, watchlist, interest
  importance: number;
}

// Earnings types
export interface EarningsEvent {
  symbol: string;
  name: string;
  reportDate: string;
  estimatedEPS?: number;
  actualEPS?: number;
  beforeMarket: boolean;
  category: string; // portfolio, watchlist, interest, considering
}

// Dividend types
export interface DividendEvent {
  symbol: string;
  name: string;
  exDividendDate?: string;
  paymentDate?: string;
  amount: number;
  category: string; // portfolio, watchlist, interest, considering
}

// Trade idea types
export interface TradeIdea {
  symbol: string;
  name: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  description: string;
  reasonsToConsider: string[];
  timeHorizon: string; // intraday, swing, long-term
  convictionLevel: string; // low, medium, high
}

// Market sentiment types
export interface MarketSentimentData {
  fearGreedIndex: number;
  putCallRatio: number;
  vix: number;
  bullishSentiment: number;
  date: string;
}

// Market summary types
export interface MarketSummaryData {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

// Market data types
export interface MarketData {
  news: News[];
  topMovers: AssetMover[];
  upcomingEarnings: EarningsEvent[];
  tradeIdeas: TradeIdea[];
  dividends: DividendEvent[];
  marketSentiment: MarketSentimentData;
  marketSummary: MarketSummaryData[];
}
