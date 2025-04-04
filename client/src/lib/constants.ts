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
  },
  marketSummary: [
    {
      name: "S&P 500",
      symbol: "SPX",
      price: 5218.06,
      change: 39.81,
      changePercent: 0.77
    },
    {
      name: "Dow Jones",
      symbol: "DJI",
      price: 39118.20,
      change: 252.51,
      changePercent: 0.65
    },
    {
      name: "Nasdaq",
      symbol: "IXIC",
      price: 16349.15,
      change: 183.04,
      changePercent: 1.13
    },
    {
      name: "Russell 2000",
      symbol: "RUT",
      price: 2042.53,
      change: -4.92,
      changePercent: -0.24
    },
    {
      name: "VIX",
      symbol: "VIX",
      price: 13.25,
      change: -0.81,
      changePercent: -5.76
    },
    {
      name: "Crude Oil",
      symbol: "CL=F",
      price: 82.34,
      change: 1.52,
      changePercent: 1.88
    },
    {
      name: "Gold",
      symbol: "GC=F",
      price: 2364.20,
      change: 19.8,
      changePercent: 0.85
    },
    {
      name: "Bitcoin",
      symbol: "BTC-USD",
      price: 69245.50,
      change: -521.34,
      changePercent: -0.75
    },
    {
      name: "10-Year Treasury",
      symbol: "^TNX",
      price: 4.32,
      change: 0.025,
      changePercent: 0.58
    }
  ]
};
