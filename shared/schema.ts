import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  tradingExperience: text("trading_experience").notNull(),
  tradingStyles: jsonb("trading_styles").notNull(),
  tradingGoals: jsonb("trading_goals").notNull(),
  interestTags: jsonb("interest_tags").notNull().default("[]"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Assets schema
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // stock, crypto, etc.
  price: real("price"),
  priceChange: real("price_change"),
  priceChangePercent: real("price_change_percent"),
  volume: real("volume"),
  marketCap: real("market_cap"),
  lastUpdated: timestamp("last_updated"),
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
});

// UserAssets schema - connecting users with their owned and followed assets
export const userAssets = pgTable("user_assets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  isOwned: boolean("is_owned").notNull().default(false),
  isFollowed: boolean("is_followed").notNull().default(false),
  isRecommended: boolean("is_recommended").notNull().default(false),
  isWorthConsidering: boolean("is_worth_considering").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserAssetSchema = createInsertSchema(userAssets).omit({
  id: true,
  createdAt: true,
});

// News schema
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  source: text("source"),
  url: text("url"),
  publishedAt: timestamp("published_at").notNull(),
  category: text("category"), // macro, company, sector, etc.
  relatedAssetId: integer("related_asset_id").references(() => assets.id),
  importance: integer("importance").default(0), // 0-10 scale for ranking importance
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
});

// Earnings schema
export const earnings = pgTable("earnings", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  reportDate: timestamp("report_date").notNull(),
  estimatedEPS: real("estimated_eps"),
  actualEPS: real("actual_eps"),
  beforeMarket: boolean("before_market"), // true = before market open, false = after market close
});

export const insertEarningsSchema = createInsertSchema(earnings).omit({
  id: true,
});

// Dividends schema
export const dividends = pgTable("dividends", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  exDividendDate: timestamp("ex_dividend_date"),
  paymentDate: timestamp("payment_date"),
  amount: real("amount").notNull(),
});

export const insertDividendSchema = createInsertSchema(dividends).omit({
  id: true,
});

// TradeIdeas schema
export const tradeIdeas = pgTable("trade_ideas", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reasonsToConsider: jsonb("reasons_to_consider").notNull(),
  timeHorizon: text("time_horizon").notNull(), // intraday, swing, long-term
  convictionLevel: text("conviction_level").notNull(), // low, medium, high
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTradeIdeaSchema = createInsertSchema(tradeIdeas).omit({
  id: true,
  createdAt: true,
});

// MarketSentiment schema
export const marketSentiment = pgTable("market_sentiment", {
  id: serial("id").primaryKey(),
  fearGreedIndex: integer("fear_greed_index"),
  putCallRatio: real("put_call_ratio"),
  vix: real("vix"),
  bullishSentiment: real("bullish_sentiment"),
  date: timestamp("date").notNull(),
});

export const insertMarketSentimentSchema = createInsertSchema(marketSentiment).omit({
  id: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type UserAsset = typeof userAssets.$inferSelect;
export type InsertUserAsset = z.infer<typeof insertUserAssetSchema>;

export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;

export type Earnings = typeof earnings.$inferSelect;
export type InsertEarnings = z.infer<typeof insertEarningsSchema>;

export type Dividend = typeof dividends.$inferSelect;
export type InsertDividend = z.infer<typeof insertDividendSchema>;

export type TradeIdea = typeof tradeIdeas.$inferSelect;
export type InsertTradeIdea = z.infer<typeof insertTradeIdeaSchema>;

export type MarketSentiment = typeof marketSentiment.$inferSelect;
export type InsertMarketSentiment = z.infer<typeof insertMarketSentimentSchema>;
