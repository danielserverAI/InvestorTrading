import { useState, RefObject, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { TabNavigation } from './TabNavigation';
import { MessageArea } from './MessageArea';
import { InputBar } from './InputBar';
import { Message, TabType, AgentType, ChatState } from './types';
import type { ChartHandle } from '@/components/charts/trading-view-chart';
import { useToast } from '@/hooks/use-toast';

const initialState: ChatState = {
  messages: [],
  activeTab: 'chat',
  selectedAgent: 'auto',
  inputValue: '',
  isProcessing: false,
};

interface ChatContainerProps {
  chartRef: RefObject<ChartHandle>;
}

// Helper function to simulate delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ChatContainer = ({ chartRef }: ChatContainerProps) => {
  const [state, setState] = useState<ChatState>(initialState);
  const { toast } = useToast();

  // Add user message function
  const addUserMessage = (content: string) => {
    const userMessage: Message = {
      id: nanoid(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));
  };

  // Add system response message function
  const addSystemMessage = (content: string, agent: AgentType = 'system') => {
    const systemMessage: Message = {
      id: nanoid(),
      type: 'system',
      content,
      timestamp: new Date(),
      agent: agent || 'system',
    };
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, systemMessage],
    }));
  };

  // Function to execute the second step: call /api/execute-chart-analysis
  const executeChartAnalysis = useCallback(async (originalQuery: string) => {
    if (!chartRef?.current) {
      addSystemMessage('Error: Chart reference is not available.');
      toast({ title: 'Error', description: 'Chart reference is not available.', variant: 'destructive' });
      return;
    }

    try {
      // Get both context and visible range
      const chartContext = chartRef.current.getChartContext();
      const visibleRange = chartRef.current.getVisibleRange();

      if (!visibleRange) {
          addSystemMessage('Error: Could not get visible chart range.');
          toast({ title: 'Error', description: 'Could not get visible chart range.', variant: 'destructive' });
          return;
      }
      
      addSystemMessage(`Fetching analysis for "${originalQuery}"... (Visible range: ${new Date((visibleRange.from as number)*1000).toLocaleDateString()} - ${new Date((visibleRange.to as number)*1000).toLocaleDateString()})`, 'system');

      const analysisResponse = await fetch('/api/execute-chart-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            chartContext, 
            originalQuery, 
            visibleRange // Send visible range to backend
        })
      });

      const analysisData = await analysisResponse.json();

      if (!analysisResponse.ok || !analysisData.success) {
        throw new Error(analysisData.error || `API request failed with status ${analysisResponse.status}`);
      }

      addSystemMessage(analysisData.response, 'auto');

    } catch (error) {
      console.error('Chart analysis execution error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to execute chart analysis';
      addSystemMessage(`Error executing analysis: ${errorMsg}`, 'system');
      toast({ title: 'Analysis Execution Error', description: errorMsg, variant: 'destructive' });
    }
  }, [chartRef, toast]);

  const handleTabChange = (tab: TabType) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  // UPDATED: Handler for the analyze chart button
  const handleAnalyzeChart = useCallback(async () => {
    if (state.isProcessing) return;
    console.log("[handleAnalyzeChart] Button clicked.");

    const predefinedQuery = "Analyze the current chart.";
    setState((prev) => ({ ...prev, isProcessing: true }));
    addSystemMessage(`Requesting analysis: "${predefinedQuery}"`, 'system');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: predefinedQuery })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `API request failed with status ${response.status}`);
      }

      if (data.actionRequired === 'get_chart_context') {
        console.log("[handleAnalyzeChart] Received request for chart context.");
        await executeChartAnalysis(data.followUpQuery);
      } else {
        console.log("[handleAnalyzeChart] Received direct text response.");
        addSystemMessage(data.response, 'auto');
      }

    } catch (error) {
      console.error('Analyze Chart button error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to process chart analysis request';
      addSystemMessage(`Error: ${errorMsg}`, 'system');
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  }, [state.isProcessing, toast, executeChartAnalysis]);

  // UPDATED: Handler for sending user messages
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isProcessing) return;
    console.log("[handleSendMessage] Received:", content);

    addUserMessage(content);
    setState((prev) => ({ ...prev, isProcessing: true }));

    try {
      console.log("[handleSendMessage] Calling /api/chat...");
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `API request failed with status ${response.status}`);
      }

      if (data.actionRequired === 'get_chart_context') {
        console.log("[handleSendMessage] Received request for chart context for query:", data.followUpQuery);
        await executeChartAnalysis(data.followUpQuery);
      } else {
        console.log("[handleSendMessage] Received direct text response.");
        addSystemMessage(data.response, 'auto');
      }

    } catch (error) {
      console.error('Chat send message error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to process message';
      addSystemMessage(`Error processing message: ${errorMsg}`, 'system');
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  }, [state.isProcessing, chartRef, toast, executeChartAnalysis]);

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
          isProcessing={state.isProcessing}
          onAnalyzeChart={handleAnalyzeChart}
        />
      </div>
    </div>
  );
}; 