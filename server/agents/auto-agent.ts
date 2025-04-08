import { BaseAgent, type AgentResponse, type AgentContext as BaseAgentContext } from './base-agent';
import { TechnicalAgent } from './technical-agent';
import { NewsAgent } from './news-agent';
import { SentimentAgent } from './sentiment-agent';
import { PortfolioAgent } from './portfolio-agent';
import { PatternAgent } from './pattern-agent';

interface AgentContext {
  userId: string;
  activeTab: string;
  messageHistory: string[];
}

interface AgentResult {
  type: 'technical' | 'news' | 'sentiment' | 'portfolio' | 'pattern';
  summary: string;
  confidence: number;
  data: any;
}

interface ComprehensiveAnalysis {
  symbol?: string;
  results: AgentResult[];
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  actionableInsights: string[];
  risks: string[];
}

interface ExtendedAgentResponse extends AgentResponse {
  message: string;
  data?: {
    analysis: {
      type: string;
      data: any;
    };
  };
}

interface TechnicalIndicator {
  signal: string;
  name: string;
  value: number;
}

export class AutoAgent extends BaseAgent {
  private technicalAgent: TechnicalAgent;
  private newsAgent: NewsAgent;
  private sentimentAgent: SentimentAgent;
  private portfolioAgent: PortfolioAgent;
  private patternAgent: PatternAgent;

  constructor(context: BaseAgentContext) {
    super(context);
    this.technicalAgent = new TechnicalAgent(context);
    this.newsAgent = new NewsAgent(context);
    this.sentimentAgent = new SentimentAgent(context);
    this.portfolioAgent = new PortfolioAgent(context);
    this.patternAgent = new PatternAgent(context);
  }

  private extractSymbol(message: string): string | null {
    const symbolMatch = message.match(/\$?([A-Z]{1,5})/);
    return symbolMatch ? symbolMatch[1] : null;
  }

  private determineRelevantAgents(message: string): BaseAgent[] {
    const agents: BaseAgent[] = [];
    const lowerMessage = message.toLowerCase();

    // Add agents based on message content
    if (lowerMessage.includes('technical') || lowerMessage.includes('indicator')) {
      agents.push(this.technicalAgent);
    }
    if (lowerMessage.includes('news') || lowerMessage.includes('announcement')) {
      agents.push(this.newsAgent);
    }
    if (lowerMessage.includes('sentiment') || lowerMessage.includes('social')) {
      agents.push(this.sentimentAgent);
    }
    if (lowerMessage.includes('portfolio') || lowerMessage.includes('holding')) {
      agents.push(this.portfolioAgent);
    }
    if (lowerMessage.includes('pattern') || lowerMessage.includes('chart')) {
      agents.push(this.patternAgent);
    }

    // If no specific agents are determined, use all for comprehensive analysis
    return agents.length > 0 ? agents : [
      this.technicalAgent,
      this.newsAgent,
      this.sentimentAgent,
      this.patternAgent
    ];
  }

  private aggregateResults(results: ExtendedAgentResponse[]): ComprehensiveAnalysis {
    const analysis: ComprehensiveAnalysis = {
      results: [],
      overallSentiment: 'neutral',
      confidence: 0,
      actionableInsights: [],
      risks: []
    };

    let bullishCount = 0;
    let bearishCount = 0;
    let totalConfidence = 0;

    results.forEach(result => {
      if (result.data?.analysis) {
        const { type, data } = result.data.analysis;
        
        // Calculate sentiment and confidence for each result
        let resultConfidence = 0;
        let isBullish = false;

        switch (type) {
          case 'technical':
            resultConfidence = (data.indicators as TechnicalIndicator[]).filter(i => i.signal !== 'neutral').length / data.indicators.length;
            isBullish = (data.indicators as TechnicalIndicator[]).filter(i => i.signal === 'buy').length >
                       (data.indicators as TechnicalIndicator[]).filter(i => i.signal === 'sell').length;
            break;
          case 'news':
            resultConfidence = data.overallSentiment.score;
            isBullish = data.overallSentiment.label === 'positive';
            break;
          case 'sentiment':
            resultConfidence = data.overallSentiment.confidence;
            isBullish = data.overallSentiment.score > 0;
            break;
          case 'pattern':
            resultConfidence = data.patterns[0]?.confidence || 0;
            isBullish = data.trendAnalysis.primary === 'uptrend';
            break;
        }

        if (isBullish) bullishCount++;
        else bearishCount++;
        totalConfidence += resultConfidence;

        analysis.results.push({
          type: type as AgentResult['type'],
          summary: result.message,
          confidence: resultConfidence,
          data: data
        });
      }
    });

    // Calculate overall sentiment and confidence
    analysis.overallSentiment = bullishCount > bearishCount ? 'bullish' :
                               bearishCount > bullishCount ? 'bearish' : 'neutral';
    analysis.confidence = totalConfidence / results.length;

    // Generate actionable insights and risks
    analysis.actionableInsights = this.generateActionableInsights(analysis.results);
    analysis.risks = this.generateRisks(analysis.results);

    return analysis;
  }

  private generateActionableInsights(results: AgentResult[]): string[] {
    const insights: string[] = [];
    
    results.forEach(result => {
      switch (result.type) {
        case 'technical':
          const strongSignals = (result.data.indicators as TechnicalIndicator[]).filter(i => i.signal !== 'neutral');
          if (strongSignals.length > 0) {
            insights.push(`Strong ${strongSignals[0].signal} signal from ${strongSignals[0].name}`);
          }
          break;
        case 'news':
          if (result.data.overallSentiment.score > 0.5) {
            insights.push(`Significant positive news sentiment with high impact potential`);
          }
          break;
        case 'pattern':
          if (result.data.patterns[0]?.confidence > 0.8) {
            insights.push(`High-confidence ${result.data.patterns[0].type} pattern detected`);
          }
          break;
      }
    });

    return insights;
  }

  private generateRisks(results: AgentResult[]): string[] {
    const risks: string[] = [];
    
    results.forEach(result => {
      switch (result.type) {
        case 'technical':
          const overextended = (result.data.indicators as TechnicalIndicator[]).find(i => i.name === 'RSI(14)' && 
            (i.value > 70 || i.value < 30));
          if (overextended) {
            risks.push(`RSI indicates ${overextended.value > 70 ? 'overbought' : 'oversold'} conditions`);
          }
          break;
        case 'sentiment':
          if (result.data.marketMetrics.volatilityIndex > 30) {
            risks.push(`Elevated market volatility (VIX: ${result.data.marketMetrics.volatilityIndex})`);
          }
          break;
        case 'pattern':
          if (result.data.patterns[0]?.type.includes('Reversal')) {
            risks.push(`Potential trend reversal pattern forming`);
          }
          break;
      }
    });

    return risks;
  }

  private async getAgentSuggestions(agent: BaseAgent, message: string): Promise<string[]> {
    return agent.generateSuggestions(message);
  }

  protected async generateSuggestions(message: string): Promise<string[]> {
    const relevantAgents = this.determineRelevantAgents(message);
    const suggestions = await Promise.all(
      relevantAgents.map(agent => this.getAgentSuggestions(agent, message))
    );
    return suggestions.flat();
  }

  async process(message: string): Promise<AgentResponse> {
    const symbol = this.extractSymbol(message);
    const relevantAgents = this.determineRelevantAgents(message);

    try {
      const results = await Promise.all(
        relevantAgents.map(agent => agent.process(message))
      );

      const analysis = this.aggregateResults(results as ExtendedAgentResponse[]);
      if (symbol) analysis.symbol = symbol;

      // Generate a natural language summary
      const summary = [
        symbol ? `Comprehensive Analysis for $${symbol}:` : 'Comprehensive Analysis:',
        `\nOverall Sentiment: ${analysis.overallSentiment.toUpperCase()} (${(analysis.confidence * 100).toFixed(1)}% confidence)`,
        '\nKey Findings:',
        ...analysis.results.map(result =>
          `\n${result.type.toUpperCase()} ANALYSIS:${result.summary.split('\n').map(line => `\n  ${line}`).join('')}`
        ),
        '\nActionable Insights:',
        ...analysis.actionableInsights.map(insight => `• ${insight}`),
        '\nKey Risks:',
        ...analysis.risks.map(risk => `• ${risk}`)
      ].join('\n');

      // Generate relevant suggestions
      const suggestions = await this.generateSuggestions(message);

      return this.formatResponse(summary, {
        analysis: {
          type: 'comprehensive',
          data: analysis
        },
        suggestions: suggestions.slice(0, 3)  // Limit to top 3 suggestions
      });
    } catch (error) {
      return this.formatResponse(
        `Error performing comprehensive analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
} 