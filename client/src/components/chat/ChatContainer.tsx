import { useState } from 'react';
import { nanoid } from 'nanoid';
import { TabNavigation } from './TabNavigation';
import { MessageArea } from './MessageArea';
import { InputBar } from './InputBar';
import { Message, TabType, AgentType, ChatState } from './types';
import { useToast } from '@/hooks/use-toast';

const initialState: ChatState = {
  messages: [],
  activeTab: 'chat',
  selectedAgent: 'auto',
  inputValue: '',
  isProcessing: false,
};

export const ChatContainer = () => {
  const [state, setState] = useState<ChatState>(initialState);
  const { toast } = useToast();

  const handleTabChange = (tab: TabType) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  const handleAgentChange = (agent: AgentType) => {
    setState((prev) => ({ ...prev, selectedAgent: agent }));
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: nanoid(),
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isProcessing: true,
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          agent: state.selectedAgent,
          tab: state.activeTab,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to process message');
      }

      const systemMessage: Message = {
        id: nanoid(),
        type: 'system',
        content: data.response,
        timestamp: new Date(),
        agent: state.selectedAgent,
        metadata: {
          command: content,
        },
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, systemMessage],
        isProcessing: false,
      }));
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process message',
        variant: 'destructive',
      });

      setState((prev) => ({
        ...prev,
        isProcessing: false,
      }));
    }
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-background dark:bg-neutral-900 overflow-hidden rounded-xl">
      {/* <TabNavigation
        activeTab={state.activeTab}
        onTabChange={handleTabChange}
      /> */}
      {/* Title Header - Prevent shrinking */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0 bg-white dark:bg-neutral-900">
        <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">AI Assistant</h2>
      </div>
      {/* MessageArea should handle its own growth and scrolling */}
      <MessageArea messages={state.messages} />
      {/* InputBar Wrapper - Prevent shrinking */}
      <div className="flex-shrink-0">
        <InputBar
          onSend={handleSendMessage}
          onAgentChange={handleAgentChange}
          selectedAgent={state.selectedAgent}
          isProcessing={state.isProcessing}
        />
      </div>
    </div>
  );
}; 