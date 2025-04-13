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
  lastResponseId: null,
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
  const addSystemMessage = (
    content: string, 
    agent: AgentType = 'system', 
    responseId: string | null = null
  ) => {
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
      lastResponseId: responseId ?? prev.lastResponseId,
    }));
  };

  // Function to execute the second step: submit chart context and tool results
  const executeChartAnalysis = useCallback(async (
    originalQuery: string, 
    toolCallId: string, 
    toolCall: any,
    originalInput: any[],
    retryCount = 0
  ) => {
    const MAX_RETRIES = 2;
    if (retryCount > MAX_RETRIES) {
        addSystemMessage("Error: AI seems stuck requesting chart data repeatedly. Please try rephrasing.", 'system');
        toast({ title: 'Error', description: 'AI stuck in analysis loop.', variant: 'destructive' });
        setState((prev) => ({ ...prev, isProcessing: false })); 
        return; 
    }

    if (!chartRef?.current) {
      addSystemMessage('Error: Chart reference is not available.');
      toast({ title: 'Error', description: 'Chart reference is not available.', variant: 'destructive' });
      setState((prev) => ({ ...prev, isProcessing: false })); 
      return;
    }

    try {
      const chartContext = chartRef.current.getChartContext();
            
      if (retryCount === 0) {
          addSystemMessage(`Submitting chart data for analysis of "${originalQuery}"...`, 'system');
      } else {
          addSystemMessage(`Re-submitting chart data (attempt ${retryCount + 1})...`, 'system');
      }

      const analysisResponse = await fetch('/api/submit-chart-context', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            chartContext, 
            originalQuery, 
            toolCallId,     
            toolCall,       
            originalInput   
        })
      });

      const analysisData = await analysisResponse.json();

      if (!analysisResponse.ok || !analysisData.success) {
        throw new Error(analysisData.error || `API request failed with status ${analysisResponse.status}`);
      }

      if (analysisData.actionRequired === 'get_chart_context') {
        console.log(`[executeChartAnalysis] Received request for chart context AGAIN (Retry ${retryCount + 1}).`);
        await executeChartAnalysis(
          analysisData.followUpQuery, 
          analysisData.toolCallId,    
          analysisData.toolCall,      
          originalInput,             
          retryCount + 1              
        );
      } else if (analysisData.response) {
        console.log("[executeChartAnalysis] Received final text response.");
        addSystemMessage(analysisData.response, 'auto', analysisData.responseId); 
      } else {
         throw new Error("Received unexpected data structure after submitting chart context.");
      }

    } catch (error) {
      console.error('Chart analysis submission error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to submit chart analysis';
      addSystemMessage(`Error submitting analysis: ${errorMsg}`, 'system');
      toast({ title: 'Analysis Submission Error', description: errorMsg, variant: 'destructive' });
      setState((prev) => ({ ...prev, isProcessing: false })); 
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
    setState((prev) => ({ ...prev, isProcessing: true, lastResponseId: null }));
    addSystemMessage(`Requesting analysis: "${predefinedQuery}"`, 'system');
    const inputMessageForApi = {
      role: 'user',
      content: [{ type: 'input_text', text: predefinedQuery } as const]
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: predefinedQuery, previous_response_id: null }) 
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `API request failed with status ${response.status}`);
      }

      if (data.actionRequired === 'get_chart_context') {
        console.log("[handleAnalyzeChart] Received request for chart context.");
        setState(prev => ({ ...prev, lastResponseId: data.responseId }));
        await executeChartAnalysis(
          data.followUpQuery, 
          data.toolCallId, 
          data.toolCall,      
          [inputMessageForApi], 
          0 
        );
      } else {
        console.log("[handleAnalyzeChart] Received direct text response.");
        addSystemMessage(data.response, 'auto', data.responseId);
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
    const idToSend = state.lastResponseId; 
    setState((prev) => ({ ...prev, isProcessing: true }));

    const inputMessageForApi = {
      role: 'user',
      content: [{ type: 'input_text', text: content } as const]
    };

    try {
      console.log(`[handleSendMessage] Calling /api/chat... (previous_id: ${idToSend})`);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, previous_response_id: idToSend })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `API request failed with status ${response.status}`);
      }

      if (data.actionRequired === 'get_chart_context') {
        console.log("[handleSendMessage] Received request for chart context for query:", data.followUpQuery);
        setState(prev => ({ ...prev, lastResponseId: data.responseId }));
        await executeChartAnalysis(
          data.followUpQuery, 
          data.toolCallId, 
          data.toolCall,      
          [inputMessageForApi], 
          0 
        );
      } else {
        console.log("[handleSendMessage] Received direct text response.");
        addSystemMessage(data.response, 'auto', data.responseId);
      }

    } catch (error) {
      console.error('Chat send message error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to process message';
      addSystemMessage(`Error processing message: ${errorMsg}`, 'system');
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  }, [state.isProcessing, state.lastResponseId, chartRef, toast, executeChartAnalysis]);

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