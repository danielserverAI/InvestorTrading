import type { TabType } from '../../client/src/components/chat/types';

export interface AgentContext {
  userId: string;
  activeTab: TabType;
  messageHistory: string[];
}

export interface AgentResponse {
  content: string;
  metadata?: {
    command?: string;
    analysis?: {
      type: string;
      data: any;
    };
    suggestions?: string[];
  };
}

export abstract class BaseAgent {
  protected context: AgentContext;

  constructor(context: AgentContext) {
    this.context = context;
  }

  abstract process(message: string): Promise<AgentResponse>;

  protected async getMessageContext(): Promise<string> {
    // Get the last 5 messages for context
    return this.context.messageHistory.slice(-5).join('\n');
  }

  public async generateSuggestions(message: string): Promise<string[]> {
    // TODO: Implement suggestion generation based on current context
    return [];
  }

  protected async validateCommand(command: string): Promise<boolean> {
    // TODO: Implement command validation
    return true;
  }

  protected formatResponse(content: string, metadata?: AgentResponse['metadata']): AgentResponse {
    return {
      content,
      metadata
    };
  }
} 