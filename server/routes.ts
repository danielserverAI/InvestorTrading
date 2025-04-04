import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

import { DEFAULT_SAMPLE_MARKET_DATA } from "../client/src/lib/constants";

// Sample market data for different times of day
const sampleMarketData = {
  morning: {
    marketSummary: DEFAULT_SAMPLE_MARKET_DATA.marketSummary,
    news: [
      {
        id: 1,
        title: "Fed Expected to Hold Rates Steady at June Meeting",
        content: "Analysts widely anticipate the Federal Reserve will maintain current rates but signal potential cuts later this year.",
        source: "Bloomberg",
        url: "https://example.com/fed-rates",
        publishedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        category: "macro",
        importance: 8
      },
      {
        id: 2,
        title: "CPI Data Release Expected Wednesday",
        content: "May inflation figures will be closely watched for signs of cooling price pressures.",
        source: "CNBC",
        url: "https://example.com/cpi-data",
        publishedAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
        category: "macro",
        importance: 6
      },
      {
        id: 3,
        title: "AAPL: Apple Expected to Unveil New AI Features at WWDC",
        content: "Company likely to showcase AI integration across iOS 18, potentially affecting competitive position against Google.",
        source: "Reuters",
        url: "https://example.com/apple-ai",
        publishedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        category: "portfolio",
        importance: 7
      },
      {
        id: 4,
        title: "MSFT: Microsoft Expands Cloud Infrastructure with $15B Investment",
        content: "Company announces major expansion of data centers to meet growing AI demand.",
        source: "WSJ",
        url: "https://example.com/msft-cloud",
        publishedAt: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
        category: "portfolio",
        importance: 7
      },
      {
        id: 5,
        title: "NVDA: Nvidia Sets New Partnership with Taiwan Manufacturers",
        content: "Deal aims to boost production capacity for AI chips facing continued high demand.",
        source: "Financial Times",
        url: "https://example.com/nvidia-taiwan",
        publishedAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        category: "watchlist",
        importance: 6
      }
    ],
    topMovers: [
      {
        id: 1,
        symbol: "AAPL",
        name: "Apple Inc.",
        type: "stock",
        price: 189.83,
        priceChange: 3.42,
        priceChangePercent: 1.83,
        volume: 4300000,
        marketCap: 2940000000000,
        category: "portfolio"
      },
      {
        id: 2,
        symbol: "NVDA",
        name: "Nvidia Corp.",
        type: "stock",
        price: 1134.70,
        priceChange: 28.92,
        priceChangePercent: 2.62,
        volume: 5800000,
        marketCap: 2790000000000,
        category: "watchlist"
      },
      {
        id: 3,
        symbol: "TSLA",
        name: "Tesla Inc.",
        type: "stock",
        price: 182.16,
        priceChange: -6.37,
        priceChangePercent: -3.38,
        volume: 12700000,
        marketCap: 579570000000,
        category: "interest"
      },
      {
        id: 4,
        symbol: "AMD",
        name: "Advanced Micro Devices",
        type: "stock",
        price: 164.78,
        priceChange: 3.85,
        priceChangePercent: 2.39,
        volume: 2600000,
        marketCap: 266320000000,
        category: "considering"
      }
    ],
    upcomingEarnings: [
      {
        symbol: "ORCL",
        name: "Oracle Corp.",
        reportDate: "2023-06-11T00:00:00.000Z",
        estimatedEPS: 1.32,
        beforeMarket: false,
        category: "portfolio"
      },
      {
        symbol: "ADBE",
        name: "Adobe Inc.",
        reportDate: "2023-06-13T00:00:00.000Z",
        estimatedEPS: 4.14,
        beforeMarket: false,
        category: "watchlist"
      },
      {
        symbol: "FDX",
        name: "FedEx Corp.",
        reportDate: "2023-06-18T00:00:00.000Z",
        estimatedEPS: 5.43,
        beforeMarket: false,
        category: "interest"
      },
      {
        symbol: "KMX",
        name: "CarMax Inc.",
        reportDate: "2023-06-21T00:00:00.000Z",
        estimatedEPS: 0.42,
        beforeMarket: true,
        category: "considering"
      }
    ],
    tradeIdeas: [
      {
        symbol: "AMD",
        name: "Advanced Micro Devices",
        price: 164.78,
        priceChange: 3.85,
        priceChangePercent: 2.39,
        description: "AMD likely to benefit from datacenter AI adoption and CPU market share gains from Intel. Several OEMs recently expanded AMD-based PC lineups.",
        reasonsToConsider: [
          "Recent product announcement for AI accelerators",
          "Technical breakout above 200-day moving average",
          "Positive analyst coverage with target increases",
          "Aligns with your interest in semiconductor stocks"
        ],
        timeHorizon: "swing",
        convictionLevel: "high"
      },
      {
        symbol: "PYPL",
        name: "PayPal Holdings",
        price: 61.23,
        priceChange: 0.51,
        priceChangePercent: 0.84,
        description: "PayPal showing signs of stabilization after extended decline. New CEO focusing on operational efficiency and margin improvement.",
        reasonsToConsider: [
          "Significant valuation discount to historical average",
          "Positive changes in executive leadership",
          "Potential beneficiary of continued e-commerce growth",
          "Complements your portfolio's tech exposure"
        ],
        timeHorizon: "long-term",
        convictionLevel: "medium"
      }
    ],
    dividends: [
      {
        symbol: "MSFT",
        name: "Microsoft Corp.",
        exDividendDate: "2023-06-15T00:00:00.000Z",
        amount: 0.75,
        category: "portfolio"
      },
      {
        symbol: "KO",
        name: "Coca-Cola Co.",
        exDividendDate: "2023-06-16T00:00:00.000Z",
        amount: 0.46,
        category: "watchlist"
      },
      {
        symbol: "JNJ",
        name: "Johnson & Johnson",
        paymentDate: "2023-06-12T00:00:00.000Z",
        amount: 1.19,
        category: "portfolio"
      }
    ],
    marketSentiment: {
      fearGreedIndex: 65,
      putCallRatio: 0.78,
      vix: 13.25,
      bullishSentiment: 58,
      date: new Date().toISOString()
    }
  },
  midday: {
    // Similar structure with midday-specific data
    marketSummary: DEFAULT_SAMPLE_MARKET_DATA.marketSummary,
    news: [
      {
        id: 1,
        title: "Market Showing Strength Despite Mixed Economic Signals",
        content: "Major indices are climbing higher despite mixed economic data released this morning.",
        source: "MarketWatch",
        url: "https://example.com/market-strength",
        publishedAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        category: "macro",
        importance: 7
      },
      {
        id: 2,
        title: "MSFT: Microsoft's AI Partnership Expands to Healthcare Sector",
        content: "New deal with major hospital networks to implement AI diagnostic tools.",
        source: "CNBC",
        url: "https://example.com/msft-healthcare",
        publishedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        category: "portfolio",
        importance: 8
      }
    ],
    topMovers: [
      {
        id: 1,
        symbol: "AAPL",
        name: "Apple Inc.",
        type: "stock",
        price: 192.35,
        priceChange: 5.94,
        priceChangePercent: 3.18,
        volume: 8700000,
        marketCap: 2970000000000,
        category: "portfolio"
      }
    ],
    upcomingEarnings: [],
    tradeIdeas: [],
    dividends: [],
    marketSentiment: {
      fearGreedIndex: 68,
      putCallRatio: 0.72,
      vix: 12.85,
      bullishSentiment: 62,
      date: new Date().toISOString()
    }
  },
  power: {
    // Data for power hour
    marketSummary: DEFAULT_SAMPLE_MARKET_DATA.marketSummary,
    news: [],
    topMovers: [],
    upcomingEarnings: [],
    tradeIdeas: [],
    dividends: [],
    marketSentiment: {
      fearGreedIndex: 64,
      putCallRatio: 0.74,
      vix: 14.20,
      bullishSentiment: 56,
      date: new Date().toISOString()
    }
  },
  after: {
    // Data for after hours
    marketSummary: DEFAULT_SAMPLE_MARKET_DATA.marketSummary,
    news: [],
    topMovers: [],
    upcomingEarnings: [],
    tradeIdeas: [],
    dividends: [],
    marketSentiment: {
      fearGreedIndex: 62,
      putCallRatio: 0.76,
      vix: 14.50,
      bullishSentiment: 54,
      date: new Date().toISOString()
    }
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get("/api/users/me", async (req: Request, res: Response) => {
    // In a real app, get the user from the session
    // For demo, return a mock user or null
    const user = await storage.getUserByUsername("demo_user");
    
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    return res.json(user);
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const user = await storage.createUser(data);
      
      // In a real app, you'd also set up the session here
      
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/users/me", async (req: Request, res: Response) => {
    try {
      // In a real app, update user from the session
      // For demo, update the user from storage
      const user = await storage.getUserByUsername("demo_user");
      
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Update fields
      const updatedUser = {
        ...user,
        ...req.body,
      };
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    // In a real app, destroy the session
    res.json({ success: true });
  });

  // Market Data API
  app.get("/api/market-data/:view", (req: Request, res: Response) => {
    const view = req.params.view;
    
    if (view && ["morning", "midday", "power", "after"].includes(view)) {
      return res.json(sampleMarketData[view as keyof typeof sampleMarketData]);
    }
    
    return res.status(400).json({ message: "Invalid view parameter" });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
