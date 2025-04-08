export type TabType = 'chat' | 'news' | 'market-movers' | 'ai-ideas' | 'sentiment' | 'calendar';

export type AgentType = 'auto' | 'technical' | 'news' | 'sentiment' | 'portfolio' | 'patterns';

export interface Message {
  id: string;
  type: 'user' | 'system';
  content: string | React.ReactNode;
  timestamp: Date;
  agent?: AgentType;
  metadata?: {
    command?: string;
    context?: any;
  };
}

export interface Agent {
  type: AgentType;
  name: string;
  description: string;
  icon?: string;
}

export interface ChatState {
  messages: Message[];
  activeTab: TabType;
  selectedAgent: AgentType;
  inputValue: string;
  isProcessing: boolean;
} 