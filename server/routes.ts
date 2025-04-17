import type { Express, Request, Response } from "express";
import { createServer, Server } from "http";  // Remove 'type' from Server import since we're using both
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

// Define types from lightweight-charts if not already shared
// These might need adjustment based on the actual library version/usage
interface TimeScaleVisibleRange {
  from: number; // Assuming Time is represented as a number (timestamp)
  to: number;
}

interface SeriesMarkerInfo {
    time: number;
    position: string; // 'aboveBar' | 'belowBar' | 'inBar'
    color: string;
    shape: string; // 'arrowUp' | 'arrowDown' | 'circle' | 'square'
    text?: string; // Optional text from marker
    // id?: string | number; // Optional internal ID
    // size?: number; // Optional size
}

// Helper function for timestamp conversion - moved outside block
const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
};

// Helper function to calculate rate of change based on interval
const calculateRateOfChange = (data: ProcessedChartDataPoint[], interval: string): string => {
    // Define lookback periods based on interval
    const lookbackPeriods: Record<string, number> = {
        '1D': 5,    // 5 bars for intraday
        '1W': 4,    // 4 weeks
        '1M': 3,    // 3 months
        '1Y': 12    // 12 months
    };

    const periods = lookbackPeriods[interval] || 5;  // Default to 5 periods if interval not recognized
    
    // Check if we have enough data
    if (data.length <= periods) {
        // If not enough data, calculate from beginning
        const startPrice = data[0]?.close;
        const endPrice = data[data.length - 1]?.close;
        
        if (typeof startPrice === 'number' && typeof endPrice === 'number') {
            return ((endPrice - startPrice) / startPrice * 100).toFixed(2) + '%';
        }
        return '0.00%';
    }

    // Calculate ROC with proper lookback
    const currentPrice = data[data.length - 1]?.close;
    const pastPrice = data[data.length - 1 - periods]?.close;
    
    if (typeof currentPrice === 'number' && typeof pastPrice === 'number') {
        return ((currentPrice - pastPrice) / pastPrice * 100).toFixed(2) + '%';
    }
    
    return '0.00%';
};

import { processChartData, calculateChartStatistics } from './services/chartAnalysis';
import { ChartDataPoint, ProcessedChartDataPoint } from './types';

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

  // --- UPDATED Chat Endpoint (using /v1/responses) ---
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { content, previous_response_id, model } = req.body as { 
          content: string; 
          previous_response_id?: string | null; 
          model?: string;
      };
      
      const requestedModel = model || 'gpt-4o-mini';

      if (!content) {
        return res.status(400).json({ success: false, error: "Missing content in request body" });
      }
      
      // *** Define the System Prompt ***
      const systemPrompt = `You are a helpful financial analyst assistant integrated into a charting application. Your primary goal is to analyze chart data and user queries to provide insightful commentary.

Key Capabilities and Instructions:
- Analyze Chart Context: When asked about the chart, use the 'get_current_chart_analysis' function to request the necessary data (visible price bars, markers, etc.).
- Place Markers: Use the 'place_chart_marker' function *proactively* when your analysis identifies significant points (e.g., highest/lowest price in a period, potential buy/sell signals, key support/resistance levels discussed) that would benefit the user visually. Always provide a descriptive text label for the marker.
- Interpret Markers: Understand that 'B' markers or green up arrows generally indicate potential Buy signals/entries, and 'S' markers or red down arrows indicate potential Sell signals/exits.
- Temporal Logic: When discussing signals or entry/exit points based on markers or analysis, ensure your reasoning is temporally logical. An exit point must occur *after* an entry point or signal event in time. Frame advice based on current conditions unless specifically asked for historical analysis.
- Data Focus: Base your analysis primarily on the provided chart data and markers. If data is missing or unclear, state that.
- Conciseness: Be informative but concise.
- Timestamp Handling: The chart data contains Unix timestamps in seconds. When reporting dates and times, ALWAYS multiply the timestamp by 1000 before creating a Date object (e.g., new Date(timestamp * 1000)). Report dates in the user's local timezone.`;
      
      // *** Prepare Input for OpenAI ***
      let apiInput: any[] = [];
      // Only add system prompt if it's the start of a conversation (no previous_response_id)
      // Or, alternatively, always add it if the API handles it correctly with previous_response_id
      // Let's try always adding it for now, as it simplifies logic. 
      // The Responses API *should* handle context correctly. 
      // If performance degrades or context is lost, we might need to only send it initially.
      apiInput.push({ 
          role: "system", 
          content: [{ type: "input_text", text: systemPrompt } as const]
      });
      // Add the current user message
      apiInput.push({ 
          role: "user", 
          content: [{ type: "input_text", text: content } as const]
      });
      
      // Note: The Responses API uses previous_response_id to fetch history.
      // We don't need to manually add prior messages to the apiInput array here.

      // Define the function tools
      const tools = [
        {
          type: "function" as const,
          name: "get_current_chart_analysis",
          description: "Call this function ONLY if the user asks a question that specifically requires analyzing the currently displayed financial chart data (e.g., asking about trends, patterns, technical indicators, support/resistance, price action on the chart). Do not call for general financial questions or definitions.",
          parameters: { 
              type: "object" as const, 
              properties: {}, 
              required: [], 
              additionalProperties: false 
          },
          strict: true,
        },
        // *** ADD NEW TOOL DEFINITION HERE ***
        {
          type: "function" as const,
          name: "place_chart_marker",
          description: "Places a marker on the financial chart at a specific time to highlight an event or analysis point (e.g., potential buy/sell signal, important price level).",
          parameters: { 
              type: "object" as const, 
              properties: {
                  timestamp: {
                      type: "number",
                      description: "The Unix timestamp (seconds) where the marker should be placed."
                  },
                  position: {
                      type: "string",
                      enum: ["aboveBar", "belowBar", "inBar"],
                      description: "Position of the marker relative to the price bar."
                  },
                  color: {
                      type: "string",
                      description: "Color of the marker (e.g., 'red', '#2196F3', 'rgba(255,0,0,0.5)')."
                  },
                  shape: {
                      type: "string",
                      enum: ["arrowUp", "arrowDown", "circle", "square"],
                      description: "The shape of the marker."
                  },
                  text: {
                      type: "string",
                      description: "Optional text label to display with the marker."
                  }
              }, 
              required: ["timestamp", "position", "color", "shape", "text"],
              additionalProperties: false
          },
          strict: true,
        }
      ];

      console.log(`Calling /v1/responses with model: ${requestedModel}, content: "${content}"${previous_response_id ? `, previous_id: ${previous_response_id}` : ''}`);

      // Call the /v1/responses endpoint
      const response = await openai.responses.create({
        model: requestedModel,
        input: apiInput, 
        previous_response_id: previous_response_id || null,
        tools: tools, 
        tool_choice: "auto",
        store: true,
        // Add instructions about visible range
        instructions: "Please analyze only the visible portion of the chart data provided. The data points represent what is currently visible to the user in their chart view. When answering questions about highs, lows, or specific points, only consider the data points you receive. Do not make assumptions about data outside the visible range."
      });

      // Process the response output
      const output = response.output?.[0];

      // *** Log the arguments received if it's ANY function call ***
      if (output?.type === 'function_call') {
          console.log(`Function Call Requested: ${output.name}`);
          console.log("Function Call Arguments Received:", output.arguments);
      }

      if (output?.type === 'function_call' && output.name === 'get_current_chart_analysis') {
        // --- Handle Chart Analysis Request ---
        console.log("Responses API requested chart analysis function call.");
        return res.json({
          success: true,
          actionRequired: 'get_chart_context',
          responseId: response.id, 
          followUpQuery: content, 
          toolCallId: output.call_id, 
          toolCall: output,
          // Add a note to the AI about analyzing only visible data
          instructions: "Please analyze only the visible portion of the chart data provided. The data points sent to you represent what is currently visible to the user in their chart view. When answering questions about highs, lows, or specific points, only consider the data points you receive."
        });
      } else if (output?.type === 'function_call' && output.name === 'place_chart_marker') {
        // --- Handle Place Marker Request --- 
        console.log("Responses API requested place chart marker function call.");
        try {
            const markerArgs = JSON.parse(output.arguments || '{}');
            // Basic validation (can be more robust)
            if (!markerArgs.timestamp || !markerArgs.position || !markerArgs.color || !markerArgs.shape) {
                throw new Error("Missing required arguments for place_chart_marker");
            }
            return res.json({
                success: true,
                actionRequired: 'place_marker', // New action type
                responseId: response.id, // Pass response ID for potential follow-up?
                markerArgs: markerArgs, // Send parsed arguments to client
                toolCallId: output.call_id, // *** Send toolCallId ***
                toolCall: output // *** Send full toolCall object ***
            });
        } catch (parseError) {
            console.error("Error parsing place_chart_marker arguments:", parseError);
            throw new Error(`Invalid arguments received for place_chart_marker: ${output.arguments}`);
        }
      } else if (output?.type === 'message' && output.role === 'assistant') {
        // --- Handle Text Response ---
        const textResponse = response.output_text || 
                             output.content?.find(part => part.type === 'output_text')?.text || 
                             "Sorry, I couldn't generate a text response.";
        console.log("Responses API returned direct text response.");
        return res.json({
          success: true,
          response: textResponse,
          responseId: response.id, // Pass back the current response ID
        });
      } else {
        // Unexpected output structure
        console.error("Unexpected output structure from /v1/responses:", response.output);
        throw new Error("Unexpected response format from AI.");
      }

    } catch (error) {
      console.error("Chat processing error (/v1/responses):", error);
      res.status(500).json({
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error processing chat message"
      });
    }
  });

  // --- NEW Endpoint to submit tool results (chart context) --- 
  app.post("/api/submit-chart-context", async (req: Request, res: Response) => {
    try {
      const { 
        toolCallId,       
        chartContext,     
        originalQuery,    
        originalInput,    
        toolCall,         
        model,
        toolResultPayload: clientProvidedPayload
      } = req.body;
      
      const requestedModel = model || 'gpt-4o-mini';

      let finalToolResultPayload: string;
      
      if (toolCall?.name === 'place_chart_marker') {
        if (!clientProvidedPayload || typeof clientProvidedPayload !== 'string') {
          throw new Error("Missing or invalid 'toolResultPayload' for marker confirmation.");
        }
        finalToolResultPayload = clientProvidedPayload;
        console.log("Processing marker placement confirmation.");
      } else if (toolCall?.name === 'get_current_chart_analysis') {
        console.log("Processing chart context submission.");
        if (!chartContext || typeof chartContext !== 'object') {
          throw new Error("Invalid or missing 'chartContext' in request body for get_current_chart_analysis.");
        }

        if (!Array.isArray(chartContext.chartData)) {
          throw new Error("Invalid or missing chartData array in chart context.");
        }

        // Process chart data using our service
        const processedChartData = processChartData(chartContext.chartData);
        
        // Calculate statistics using our service
        const statistics = calculateChartStatistics(processedChartData, chartContext.interval);

        const payloadObject = {
          status: "success",
          symbol: chartContext.symbol,
          interval: chartContext.interval,
          chartData: processedChartData,
          markers: chartContext.markers,
          selectedPoints: Array.from(chartContext.selectedPoints || []),
          userQuery: originalQuery,
          currentTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          dataStats: statistics,
          timestampNote: "IMPORTANT: All timestamps are Unix timestamps in seconds. You MUST multiply by 1000 before creating Date objects. Only analyze data points provided within the visible range. When discussing price action, consider volume, trend patterns, and overall market context."
        };

        finalToolResultPayload = JSON.stringify(payloadObject);
      } else {
        throw new Error(`Unsupported tool call name: ${toolCall?.name}`);
      }

      // --- Define Tools (only need the one relevant to the current call?) ---
      // It might be safer to send all tools the AI *could* have used previously
      const tools = [{
        type: "function" as const,
        name: "analyzeChartContext", // Include this even if confirming marker
        description: "Analyze the provided chart context...",
        parameters: { type: "object" as const, properties: {}, required: [], additionalProperties: false },
        strict: true
      }, {
        type: "function" as const,
        name: "place_chart_marker", // Include this even if confirming context
        description: "Places a marker on the financial chart...",
         parameters: { 
            type: "object" as const, 
            properties: {
                timestamp: {
                    type: "number",
                    description: "The Unix timestamp (seconds) where the marker should be placed."
                },
                position: {
                    type: "string",
                    enum: ["aboveBar", "belowBar", "inBar"],
                    description: "Position of the marker relative to the price bar."
                },
                color: {
                    type: "string",
                    description: "Color of the marker (e.g., 'red', '#2196F3', 'rgba(255,0,0,0.5)')."
                },
                shape: {
                    type: "string",
                    enum: ["arrowUp", "arrowDown", "circle", "square"],
                    description: "The shape of the marker."
                },
                text: {
                    type: "string",
                    description: "Optional text label to display with the marker."
                }
            }, 
            required: ["timestamp", "position", "color", "shape", "text"],
            additionalProperties: false
        },
        strict: true
      }];

      // --- Validate common data ---

      // Validate received data (basic example)
      if (!originalInput || !Array.isArray(originalInput) || originalInput.length === 0) {
        throw new Error("Missing or invalid 'originalInput' in request body.");
      }
      if (!toolCall || typeof toolCall !== 'object' || toolCall.type !== 'function_call') {
        throw new Error("Missing or invalid 'toolCall' object in request body.");
      }
      if (toolCall.call_id !== toolCallId) {
         console.warn("Mismatch between toolCall.call_id and toolCallId from request body.");
         // Decide how to handle: trust toolCall.call_id? For now, use toolCallId from body.
      }

      // Prepare the input array for the follow-up call using data from the request body
      const new_input = [
        ...originalInput, // Use the input array passed from the client
        toolCall,         // Use the function_call object passed from the client
        {
          type: "function_call_output", 
          call_id: toolCallId, // Use the specific toolCallId from the request body
          output: finalToolResultPayload 
        },
        {
          // *** ADD SYSTEM MESSAGE *AFTER* FUNCTION OUTPUT ***
          role: "system",
          // Reference the original query directly in the instruction
          content: [{ type: "input_text", text: `You have received the chart data in the function output. Use this data to directly answer the user's query: "${originalQuery}"` } as const]
        }
      ];

      // --- Call /v1/responses again with tool result ---
      const response = await openai.responses.create({
        model: requestedModel, // *** Use requested model ***
        input: new_input, 
        tools: tools, 
        store: true, 
      });

      // *** Log the entire response object received after submitting tool result ***
      console.log("--- Received Response from OpenAI After Tool Submission ---");
      console.log(JSON.stringify(response, null, 2));
      // *** End Logging ***

      // Process the final response
      const output = response.output?.[0];

      if (output?.type === 'message' && output.role === 'assistant') {
        // CASE 1: Model generated a text response - SUCCESS
        const textResponse = response.output_text || 
                             output.content?.find(part => part.type === 'output_text')?.text || 
                             "Analysis generated."; // Fallback
        console.log("Received final analysis after tool call.");
        res.json({ success: true, response: textResponse, responseId: response.id });
      
      } else if (output?.type === 'function_call' && output.name === 'get_current_chart_analysis') {
        // CASE 2: Model requested ANOTHER chart analysis call - Send back to client
        console.log("OpenAI requested chart analysis AGAIN after receiving context.");
        // Note: We might be entering a loop if the model keeps calling the function.
        // Consider refining the tool or prompts if this happens frequently.
        res.json({
          success: true,
          actionRequired: 'get_chart_context', 
          responseId: response.id,            
          followUpQuery: originalQuery,       
          toolCallId: output.call_id,         
          toolCall: output                    
        });

      } else if (output?.type === 'function_call' && output.name === 'place_chart_marker') {
        // *** CASE 3: Model requested a marker placement AFTER context submission ***
        console.log("OpenAI requested place_chart_marker AFTER receiving context.");
        // Handle this the same way /api/chat handles it: send action to client
         try {
            const markerArgs = JSON.parse(output.arguments || '{}');
            if (!markerArgs.timestamp || !markerArgs.position || !markerArgs.color || !markerArgs.shape) {
                throw new Error("Missing required arguments for place_chart_marker (received in submit-context response)");
            }
            return res.json({
                success: true,
                actionRequired: 'place_marker', 
                responseId: response.id, 
                markerArgs: markerArgs, 
                toolCallId: output.call_id, 
                toolCall: output 
            });
        } catch (parseError) {
            console.error("Error parsing place_chart_marker arguments (received in submit-context response):", parseError);
            throw new Error(`Invalid arguments received for place_chart_marker: ${output.arguments}`);
        }

      } else {
        // CASE 4: Unexpected output structure
        console.error("Unexpected output structure after submitting tool result:", response.output);
        throw new Error("Unexpected response format after tool submission.");
      }

    } catch (error) {
      console.error("Error submitting chart context:", error);
      res.status(500).json({
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error submitting tool result"
      });
    }
  });

  // Create HTTP server using imported createServer
  const httpServer = createServer(app);

  return httpServer;
}
