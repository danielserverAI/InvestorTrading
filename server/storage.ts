import { 
  User, InsertUser, 
  Asset, InsertAsset,
  UserAsset, InsertUserAsset,
  News, InsertNews,
  Earnings, InsertEarnings,
  Dividend, InsertDividend,
  TradeIdea, InsertTradeIdea,
  MarketSentiment, InsertMarketSentiment
} from "@shared/schema";

// Interface to define all storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Asset methods
  getAsset(id: number): Promise<Asset | undefined>;
  getAssetBySymbol(symbol: string): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, asset: Partial<Asset>): Promise<Asset | undefined>;
  
  // UserAsset methods
  getUserAssets(userId: number): Promise<UserAsset[]>;
  createUserAsset(userAsset: InsertUserAsset): Promise<UserAsset>;
  updateUserAsset(id: number, userAsset: Partial<UserAsset>): Promise<UserAsset | undefined>;
  
  // News methods
  getNews(): Promise<News[]>;
  getNewsByCategory(category: string): Promise<News[]>;
  createNews(news: InsertNews): Promise<News>;
  
  // Earnings methods
  getUpcomingEarnings(): Promise<Earnings[]>;
  createEarnings(earnings: InsertEarnings): Promise<Earnings>;
  
  // Dividend methods
  getUpcomingDividends(): Promise<Dividend[]>;
  createDividend(dividend: InsertDividend): Promise<Dividend>;
  
  // TradeIdea methods
  getTradeIdeas(): Promise<TradeIdea[]>;
  createTradeIdea(tradeIdea: InsertTradeIdea): Promise<TradeIdea>;
  
  // MarketSentiment methods
  getMarketSentiment(): Promise<MarketSentiment | undefined>;
  createMarketSentiment(sentiment: InsertMarketSentiment): Promise<MarketSentiment>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private assets: Map<number, Asset>;
  private userAssets: Map<number, UserAsset>;
  private news: Map<number, News>;
  private earnings: Map<number, Earnings>;
  private dividends: Map<number, Dividend>;
  private tradeIdeas: Map<number, TradeIdea>;
  private marketSentiment: Map<number, MarketSentiment>;
  
  private userIdCounter: number;
  private assetIdCounter: number;
  private userAssetIdCounter: number;
  private newsIdCounter: number;
  private earningsIdCounter: number;
  private dividendIdCounter: number;
  private tradeIdeaIdCounter: number;
  private marketSentimentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.assets = new Map();
    this.userAssets = new Map();
    this.news = new Map();
    this.earnings = new Map();
    this.dividends = new Map();
    this.tradeIdeas = new Map();
    this.marketSentiment = new Map();
    
    this.userIdCounter = 1;
    this.assetIdCounter = 1;
    this.userAssetIdCounter = 1;
    this.newsIdCounter = 1;
    this.earningsIdCounter = 1;
    this.dividendIdCounter = 1;
    this.tradeIdeaIdCounter = 1;
    this.marketSentimentIdCounter = 1;
    
    // Add a demo user for development
    this.createUser({
      username: "demo_user",
      password: "password123",
      email: "demo@example.com",
      tradingExperience: "intermediate",
      tradingStyles: ["swing", "long-term"],
      tradingGoals: ["wealth", "news"],
      interestTags: ["tech", "ai"]
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date().toISOString();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Asset methods
  async getAsset(id: number): Promise<Asset | undefined> {
    return this.assets.get(id);
  }

  async getAssetBySymbol(symbol: string): Promise<Asset | undefined> {
    return Array.from(this.assets.values()).find(
      (asset) => asset.symbol === symbol,
    );
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const id = this.assetIdCounter++;
    const asset: Asset = { ...insertAsset, id };
    this.assets.set(id, asset);
    return asset;
  }

  async updateAsset(id: number, assetData: Partial<Asset>): Promise<Asset | undefined> {
    const existingAsset = this.assets.get(id);
    if (!existingAsset) return undefined;
    
    const updatedAsset = { ...existingAsset, ...assetData };
    this.assets.set(id, updatedAsset);
    return updatedAsset;
  }

  // UserAsset methods
  async getUserAssets(userId: number): Promise<UserAsset[]> {
    return Array.from(this.userAssets.values()).filter(
      (userAsset) => userAsset.userId === userId,
    );
  }

  async createUserAsset(insertUserAsset: InsertUserAsset): Promise<UserAsset> {
    const id = this.userAssetIdCounter++;
    const createdAt = new Date().toISOString();
    const userAsset: UserAsset = { ...insertUserAsset, id, createdAt };
    this.userAssets.set(id, userAsset);
    return userAsset;
  }

  async updateUserAsset(id: number, userAssetData: Partial<UserAsset>): Promise<UserAsset | undefined> {
    const existingUserAsset = this.userAssets.get(id);
    if (!existingUserAsset) return undefined;
    
    const updatedUserAsset = { ...existingUserAsset, ...userAssetData };
    this.userAssets.set(id, updatedUserAsset);
    return updatedUserAsset;
  }

  // News methods
  async getNews(): Promise<News[]> {
    return Array.from(this.news.values());
  }

  async getNewsByCategory(category: string): Promise<News[]> {
    return Array.from(this.news.values()).filter(
      (news) => news.category === category,
    );
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const id = this.newsIdCounter++;
    const news: News = { ...insertNews, id };
    this.news.set(id, news);
    return news;
  }

  // Earnings methods
  async getUpcomingEarnings(): Promise<Earnings[]> {
    return Array.from(this.earnings.values());
  }

  async createEarnings(insertEarnings: InsertEarnings): Promise<Earnings> {
    const id = this.earningsIdCounter++;
    const earnings: Earnings = { ...insertEarnings, id };
    this.earnings.set(id, earnings);
    return earnings;
  }

  // Dividend methods
  async getUpcomingDividends(): Promise<Dividend[]> {
    return Array.from(this.dividends.values());
  }

  async createDividend(insertDividend: InsertDividend): Promise<Dividend> {
    const id = this.dividendIdCounter++;
    const dividend: Dividend = { ...insertDividend, id };
    this.dividends.set(id, dividend);
    return dividend;
  }

  // TradeIdea methods
  async getTradeIdeas(): Promise<TradeIdea[]> {
    return Array.from(this.tradeIdeas.values());
  }

  async createTradeIdea(insertTradeIdea: InsertTradeIdea): Promise<TradeIdea> {
    const id = this.tradeIdeaIdCounter++;
    const createdAt = new Date().toISOString();
    const tradeIdea: TradeIdea = { ...insertTradeIdea, id, createdAt };
    this.tradeIdeas.set(id, tradeIdea);
    return tradeIdea;
  }

  // MarketSentiment methods
  async getMarketSentiment(): Promise<MarketSentiment | undefined> {
    // Return the latest sentiment
    const sentiments = Array.from(this.marketSentiment.values());
    return sentiments.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }

  async createMarketSentiment(insertMarketSentiment: InsertMarketSentiment): Promise<MarketSentiment> {
    const id = this.marketSentimentIdCounter++;
    const marketSentiment: MarketSentiment = { ...insertMarketSentiment, id };
    this.marketSentiment.set(id, marketSentiment);
    return marketSentiment;
  }
}

// Export storage instance
export const storage = new MemStorage();
