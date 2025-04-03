// Trading styles options for onboarding
export const TRADING_STYLES = [
  { value: 'long-term', label: 'Long-term investor' },
  { value: 'swing', label: 'Swing trader' },
  { value: 'day', label: 'Day trader' },
  { value: 'crypto', label: 'Crypto-focused' },
  { value: 'options', label: 'Options trader' },
];

// Trading goals options for onboarding
export const TRADING_GOALS = [
  { value: 'wealth', label: 'Grow long-term wealth' },
  { value: 'income', label: 'Generate short-term income' },
  { value: 'hedge', label: 'Hedge portfolio' },
  { value: 'news', label: 'Stay on top of market news' },
  { value: 'learn', label: 'Learn from trade ideas' },
];

// Interest tags options for onboarding
export const INTEREST_TAGS = [
  { value: 'momentum', label: 'Momentum trades' },
  { value: 'earnings', label: 'Earnings plays' },
  { value: 'dividends', label: 'Dividends' },
  { value: 'ai', label: 'Artificial Intelligence' },
  { value: 'tech', label: 'Technology' },
  { value: 'energy', label: 'Energy' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'consumer', label: 'Consumer goods' },
  { value: 'esg', label: 'ESG investments' },
];

// Default placeholder data for sample market data
// This will be replaced with actual API data in production
export const DEFAULT_SAMPLE_MARKET_DATA = {
  news: [],
  topMovers: [],
  upcomingEarnings: [],
  tradeIdeas: [],
  dividends: [],
  marketSentiment: {
    fearGreedIndex: 65,
    putCallRatio: 0.78,
    vix: 13.25,
    bullishSentiment: 58,
    date: new Date().toISOString(),
  }
};
