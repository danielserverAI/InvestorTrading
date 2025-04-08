import { BaseAgent, type AgentResponse } from './base-agent';

interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  summary: string;
}

interface NewsAnalysis {
  articles: NewsArticle[];
  overallSentiment: {
    score: number;  // -1 to 1
    label: 'positive' | 'negative' | 'neutral';
  };
  keyTopics: string[];
  potentialImpact: string;
}

export class NewsAgent extends BaseAgent {
  private async fetchNews(symbol: string): Promise<NewsArticle[]> {
    // TODO: Implement real news fetching from financial news APIs
    return [
      {
        title: "Company XYZ Beats Earnings Expectations",
        source: "Financial Times",
        url: "https://ft.com/xyz-earnings",
        publishedAt: new Date().toISOString(),
        sentiment: "positive",
        impact: "high",
        summary: "Company reported Q3 earnings above analyst expectations, driven by strong product sales."
      }
    ];
  }

  private async analyzeSentiment(articles: NewsArticle[]): Promise<{
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  }> {
    // TODO: Implement real sentiment analysis
    const sentimentScores = {
      'positive': 1,
      'negative': -1,
      'neutral': 0
    };

    const avgScore = articles.reduce((acc, article) => 
      acc + sentimentScores[article.sentiment], 0) / articles.length;

    return {
      score: avgScore,
      label: avgScore > 0.3 ? 'positive' : avgScore < -0.3 ? 'negative' : 'neutral'
    };
  }

  private extractKeyTopics(articles: NewsArticle[]): string[] {
    // TODO: Implement real topic extraction using NLP
    return [
      "Earnings",
      "Product Launch",
      "Market Expansion"
    ];
  }

  private assessImpact(articles: NewsArticle[]): string {
    // TODO: Implement real impact assessment
    const highImpactCount = articles.filter(a => a.impact === 'high').length;
    if (highImpactCount > articles.length / 2) {
      return "Significant market reaction likely due to major news events";
    }
    return "Moderate market impact expected";
  }

  private extractSymbol(message: string): string | null {
    const symbolMatch = message.match(/\$?([A-Z]{1,5})/);
    return symbolMatch ? symbolMatch[1] : null;
  }

  async process(message: string): Promise<AgentResponse> {
    const symbol = this.extractSymbol(message);
    if (!symbol) {
      return this.formatResponse(
        "I couldn't find a stock symbol in your message. Please include a symbol like $AAPL or MSFT."
      );
    }

    try {
      const articles = await this.fetchNews(symbol);
      const sentiment = await this.analyzeSentiment(articles);
      const keyTopics = this.extractKeyTopics(articles);
      const potentialImpact = this.assessImpact(articles);

      const analysis: NewsAnalysis = {
        articles,
        overallSentiment: sentiment,
        keyTopics,
        potentialImpact
      };

      // Generate a natural language summary
      const summary = [
        `News Analysis for $${symbol}:`,
        `\nOverall Sentiment: ${sentiment.label.toUpperCase()} (${(sentiment.score * 100).toFixed(1)}% confidence)`,
        `\nKey Topics: ${keyTopics.join(', ')}`,
        `\nPotential Impact: ${potentialImpact}`,
        '\nRecent Headlines:',
        ...articles.map(article => 
          `\n• ${article.title} (${article.source}) - ${article.sentiment.toUpperCase()}`
        )
      ].join('');

      // Generate relevant suggestions based on the analysis
      const suggestions = [
        `Show historical sentiment trend for $${symbol}`,
        `Compare news coverage with competitors`,
        `Analyze social media sentiment for $${symbol}`
      ];

      return this.formatResponse(summary, {
        analysis: {
          type: 'news',
          data: analysis
        },
        suggestions
      });
    } catch (error) {
      return this.formatResponse(
        `Error analyzing news for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
} 