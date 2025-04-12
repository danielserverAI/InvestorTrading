import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { processMessage } from "./chat";

// --- OpenAI and dotenv imports ---
import OpenAI from 'openai';
import { ChatCompletionTool } from "openai/resources/index.mjs"; // Import Tool type
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
// --- End OpenAI setup ---

import { DEFAULT_SAMPLE_MARKET_DATA } from "../client/src/lib/constants";

// Sample market data for different times of day
export const sampleMarketData = {
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
        reportDate: "2025-04-08T00:00:00.000Z",
        estimatedEPS: 1.32,
        beforeMarket: false,
        category: "portfolio"
      },
      {
        symbol: "ADBE",
        name: "Adobe Inc.",
        reportDate: "2025-04-10T00:00:00.000Z",
        estimatedEPS: 4.14,
        beforeMarket: false,
        category: "watchlist"
      },
      {
        symbol: "FDX",
        name: "FedEx Corp.",
        reportDate: "2025-04-15T00:00:00.000Z",
        estimatedEPS: 5.43,
        beforeMarket: false,
        category: "interest"
      },
      {
        symbol: "KMX",
        name: "CarMax Inc.",
        reportDate: "2025-04-18T00:00:00.000Z",
        estimatedEPS: 0.42,
        beforeMarket: true,
        category: "considering"
      },
      {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        reportDate: "2025-04-22T00:00:00.000Z",
        estimatedEPS: 1.67,
        beforeMarket: false,
        category: "watchlist"
      },
      {
        symbol: "MSFT",
        name: "Microsoft Corp.",
        reportDate: "2025-04-25T00:00:00.000Z",
        estimatedEPS: 2.86,
        beforeMarket: false,
        category: "portfolio"
      },
      {
        symbol: "AMZN",
        name: "Amazon.com Inc.",
        reportDate: "2025-05-02T00:00:00.000Z",
        estimatedEPS: 0.95,
        beforeMarket: false,
        category: "interest"
      },
      {
        symbol: "NFLX",
        name: "Netflix Inc.",
        reportDate: "2025-05-06T00:00:00.000Z",
        estimatedEPS: 4.23,
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
        exDividendDate: "2025-04-09T00:00:00.000Z",
        paymentDate: "2025-04-22T00:00:00.000Z",
        amount: 0.75,
        category: "portfolio"
      },
      {
        symbol: "KO",
        name: "Coca-Cola Co.",
        exDividendDate: "2025-04-12T00:00:00.000Z",
        paymentDate: "2025-04-28T00:00:00.000Z",
        amount: 0.46,
        category: "watchlist"
      },
      {
        symbol: "JNJ",
        name: "Johnson & Johnson",
        exDividendDate: "2025-04-14T00:00:00.000Z",
        paymentDate: "2025-04-30T00:00:00.000Z",
        amount: 1.19,
        category: "portfolio"
      },
      {
        symbol: "PG",
        name: "Procter & Gamble",
        exDividendDate: "2025-04-16T00:00:00.000Z",
        paymentDate: "2025-05-15T00:00:00.000Z",
        amount: 0.94,
        category: "interest"
      },
      {
        symbol: "VZ",
        name: "Verizon Communications",
        exDividendDate: "2025-04-18T00:00:00.000Z",
        paymentDate: "2025-05-01T00:00:00.000Z",
        amount: 0.67,
        category: "watchlist"
      },
      {
        symbol: "PEP",
        name: "PepsiCo Inc.",
        exDividendDate: "2025-04-21T00:00:00.000Z",
        paymentDate: "2025-05-10T00:00:00.000Z",
        amount: 1.27,
        category: "considering"
      },
      {
        symbol: "HD",
        name: "Home Depot Inc.",
        exDividendDate: "2025-05-02T00:00:00.000Z",
        paymentDate: "2025-05-20T00:00:00.000Z",
        amount: 2.25,
        category: "portfolio"
      },
      {
        symbol: "MRK",
        name: "Merck & Co.",
        exDividendDate: "2025-05-08T00:00:00.000Z",
        paymentDate: "2025-05-28T00:00:00.000Z",
        amount: 0.77,
        category: "interest"
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

  // News API routes
  app.get("/api/news", async (req: Request, res: Response) => {
    const category = req.query.category as string || 'all';
    const userId = 1; // In a real app, get this from the authenticated user
    
    try {
      // In a real app, get news from a database or external API
      // For demo, return the sample news data
      const allNews = sampleMarketData.morning.news;
      
      let filteredNews;
      if (category === 'all') {
        filteredNews = allNews;
      } else {
        filteredNews = allNews.filter(news => news.category === category);
      }
      
      // Add the intelligent categorization info
      const processedNews = filteredNews.map(news => {
        // In production, this would be done by the LLM
        const classification = getNewsClassification(news);
        return {
          ...news,
          classification: classification.classification,
          impact: classification.impact,
          whyThisMatters: classification.whyThisMatters,
          followUp: classification.followUp,
          isRead: false // In production, this would be fetched from user data
        };
      });
      
      res.json(processedNews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.patch("/api/news/:id/read", async (req: Request, res: Response) => {
    const newsId = parseInt(req.params.id);
    const userId = 1; // In a real app, get this from the authenticated user
    
    try {
      // In a real app, update the database
      // For demo, just return success
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark news as read" });
    }
  });

  app.patch("/api/news/:id/follow", async (req: Request, res: Response) => {
    const newsId = parseInt(req.params.id);
    const userId = 1; // In a real app, get this from the authenticated user
    const { follow } = req.body;
    
    try {
      // In a real app, update the database
      // For demo, just return success
      res.json({ success: true, following: follow });
    } catch (error) {
      res.status(500).json({ message: "Failed to update follow status" });
    }
  });

  // Helper function to simulate LLM categorization
  function getNewsClassification(news: any) {
    // In production, this would be an actual call to an LLM
    
    // Simulate different classifications based on the news category and content
    if (news.category === 'portfolio') {
      if (news.title.includes('AI')) {
        return {
          classification: 'Catalyst',
          impact: 'Positive',
          whyThisMatters: "This AI development directly impacts your holdings. The company's strategic position could strengthen, potentially driving stock price growth.",
          followUp: true
        };
      } else {
        return {
          classification: 'Confirmation',
          impact: 'Positive',
          whyThisMatters: "This news confirms the positive trend for one of your portfolio holdings. It aligns with the investment thesis you're following.",
          followUp: false
        };
      }
    } else if (news.category === 'watchlist') {
      return {
        classification: 'Warning',
        impact: 'Volatile',
        whyThisMatters: "This development could create volatility for a stock on your watchlist. Monitor how the market reacts before considering a position.",
        followUp: true
      };
    } else if (news.importance > 7) {
      return {
        classification: 'Catalyst',
        impact: 'Neutral',
        whyThisMatters: "This major market news could affect overall market sentiment. While not directly impacting your holdings, it's worth monitoring broader effects.",
        followUp: false
      };
    } else {
      return {
        classification: 'Noise',
        impact: 'Neutral',
        whyThisMatters: "This news is unlikely to impact your current investment strategy. No immediate action needed.",
        followUp: false
      };
    }
  }

  // --- UPDATED Chat Endpoint (Intent Detection) ---
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { content } = req.body as { content: string; };

      if (!content) {
        return res.status(400).json({ success: false, error: "Missing content in request body" });
      }

      const tools: ChatCompletionTool[] = [
        {
          type: "function",
          function: {
            name: "request_chart_analysis",
            description: "Call this function if the user asks a question that requires analyzing the currently displayed financial chart data (e.g., asking about trends, patterns, technical indicators, support/resistance, price action on the chart). Do not call if the user is asking for general information or definitions.",
            parameters: { type: "object", properties: {}, },
          },
        },
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant. You have access to a financial chart. Use the 'request_chart_analysis' function if the user's query requires analyzing the chart data." },
          { role: "user", content: content },
        ],
        tools: tools,
        tool_choice: "auto",
      });

      const responseMessage = response.choices[0].message;

      if (responseMessage.tool_calls && responseMessage.tool_calls[0]?.function?.name === 'request_chart_analysis') {
        console.log("OpenAI requested chart analysis function call.");
        return res.json({
          success: true,
          actionRequired: 'get_chart_context',
          followUpQuery: content,
        });
      } else {
        console.log("OpenAI did not request function call, returning text response.");
        const textResponse = responseMessage.content;
        return res.json({
          success: true,
          response: textResponse || "Sorry, I couldn't process that request.",
        });
      }

    } catch (error) {
      console.error("Chat processing error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error processing chat message"
      });
    }
  });

  // --- UPDATED Execute Analysis Endpoint ---
  app.post("/api/execute-chart-analysis", async (req: Request, res: Response) => {
    try {
      const { chartContext, originalQuery } = req.body as {
        chartContext: any;
        originalQuery: string;
      };

      if (!chartContext || !originalQuery) {
        return res.status(400).json({ success: false, error: "Missing chartContext or originalQuery" });
      }

      console.log(`Executing analysis for query: "${originalQuery}"...`);

      const systemPrompt = "You are a helpful financial analyst assistant. Analyze the provided chart data and user query, providing concise and relevant insights based on the information given.";
      const userPrompt = `Analyze the following chart data for ${chartContext.symbol} (${chartContext.interval}):\n\nData points (sample): ${JSON.stringify(chartContext.chartData?.slice(0, 5))}... (${chartContext.chartData?.length} total points)\nMarkers: ${JSON.stringify(chartContext.markers)}\n\nUser Query: ${originalQuery}`;

      const chatCompletion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: "gpt-3.5-turbo",
      });

      const analysis = chatCompletion.choices[0]?.message?.content;

      if (!analysis) {
        throw new Error("OpenAI did not return a valid analysis for execution.");
      }

      console.log("Received final analysis from OpenAI.");
      res.json({ success: true, response: analysis });

    } catch (error) {
      console.error("Chart analysis execution error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error executing chart analysis"
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
