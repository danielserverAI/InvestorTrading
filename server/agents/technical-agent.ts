import { BaseAgent, type AgentResponse } from './base-agent';

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
}

interface ChartPattern {
  type: string;
  confidence: number;
  description: string;
}

export class TechnicalAgent extends BaseAgent {
  private async analyzeIndicators(symbol: string): Promise<TechnicalIndicator[]> {
    // TODO: Implement real technical indicator calculations
    return [
      {
        name: 'RSI(14)',
        value: 65.42,
        signal: 'neutral'
      },
      {
        name: 'MACD',
        value: 0.75,
        signal: 'buy'
      },
      {
        name: 'Moving Average (200)',
        value: 185.30,
        signal: 'buy'
      }
    ];
  }

  private async detectPatterns(symbol: string): Promise<ChartPattern[]> {
    // TODO: Implement real pattern detection
    return [
      {
        type: 'Bull Flag',
        confidence: 0.85,
        description: 'Potential continuation pattern forming with strong volume support'
      }
    ];
  }

  private async analyzeSupportResistance(symbol: string): Promise<{
    support: number[];
    resistance: number[];
  }> {
    // TODO: Implement real support/resistance detection
    return {
      support: [180.50, 175.20],
      resistance: [195.30, 200.00]
    };
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
      const [indicators, patterns, levels] = await Promise.all([
        this.analyzeIndicators(symbol),
        this.detectPatterns(symbol),
        this.analyzeSupportResistance(symbol)
      ]);

      const analysis = {
        symbol,
        indicators,
        patterns,
        supportResistance: levels
      };

      // Generate a natural language summary
      const indicatorSignals = indicators
        .filter(i => i.signal !== 'neutral')
        .map(i => `${i.name} shows a ${i.signal} signal at ${i.value}`);
      
      const patternDesc = patterns
        .map(p => `${p.type} pattern detected with ${(p.confidence * 100).toFixed(1)}% confidence`);

      const levelsDesc = `Support levels at ${levels.support.join(', ')} and resistance at ${levels.resistance.join(', ')}`;

      const summary = [
        `Technical Analysis for $${symbol}:`,
        indicatorSignals.length ? `\nIndicators:\n${indicatorSignals.join('\n')}` : '',
        patternDesc.length ? `\nPatterns:\n${patternDesc.join('\n')}` : '',
        `\nKey Levels:\n${levelsDesc}`
      ].join('\n');

      // Generate relevant suggestions based on the analysis
      const suggestions = [
        `Show RSI trend for $${symbol}`,
        `Compare $${symbol} with sector performance`,
        `Analyze volume profile for $${symbol}`
      ];

      return this.formatResponse(summary, {
        analysis: {
          type: 'technical',
          data: analysis
        },
        suggestions
      });
    } catch (error) {
      return this.formatResponse(
        `Error analyzing ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
} 