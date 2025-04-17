import { useState, RefObject, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { TabNavigation } from './TabNavigation';
import { MessageArea } from './MessageArea';
import { InputBar } from './InputBar';
import { Message, TabType, AgentType, ChatState } from './types';
import type { ChartHandle } from '@/components/charts/trading-view-chart';
import { useToast } from '@/hooks/use-toast';
import { Time } from 'lightweight-charts';
import { CandlestickData, BarData } from 'lightweight-charts';

const initialState: ChatState = {
  messages: [],
  activeTab: 'chat',
  selectedAgent: 'auto',
  inputValue: '',
  isProcessing: false,
  lastResponseId: null,
  selectedModel: 'gpt-4o-mini', // Default model
};

interface ChatContainerProps {
  chartRef: RefObject<ChartHandle>;
}

interface DataPoint {
    time: Time;
    high?: number;
    low?: number;
    value?: number;
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

  // *** Handler for model change ***
  const handleModelChange = (model: string) => {
      setState(prev => ({ ...prev, selectedModel: model }));
  };

  // Function to execute the second step: submit chart context and tool results
  const executeChartAnalysis = useCallback(async (
    originalQuery: string, 
    toolCallId: string, 
    toolCall: any,
    originalInput: any[],
    model: string,
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
      const visibleRange = chartRef.current.getVisibleRange();
      
      if (!chartContext || !visibleRange) {
          console.error("[executeChartAnalysis] Missing chart context or visible range");
          return;
      }

      const { chartData } = chartContext;
      const fromTime = visibleRange.from as number;
      const toTime = visibleRange.to as number;

      // Filter to only visible data points
      const visibleData = chartData.filter(d => {
          const pointTime = typeof d.time === 'number' ? d.time : parseFloat(d.time as string);
          return pointTime >= fromTime && pointTime <= toTime;
      }) as (CandlestickData<Time> | BarData<Time>)[];

      // Validate visible range dates
      const visibleRangeStr = {
          from: new Date(fromTime * 1000).toLocaleString(),
          to: new Date(toTime * 1000).toLocaleString()
      };

      console.log("[executeChartAnalysis] Analyzing visible range:", {
          range: visibleRangeStr,
          dataPoints: {
              total: chartData.length,
              visible: visibleData.length
          }
      });

      // Calculate price extremes from visible data only
      let highestPrice = -Infinity;
      let lowestPrice = Infinity;
      let highestPoint: (CandlestickData<Time> & { formattedTime: string }) | null = null;
      let lowestPoint: (CandlestickData<Time> & { formattedTime: string }) | null = null;

      visibleData.forEach(d => {
          if ('high' in d && 'low' in d) {
              const formattedTime = new Date((d.time as number) * 1000).toLocaleString();
              if (d.high > highestPrice) {
                  highestPrice = d.high;
                  highestPoint = { ...d, formattedTime };
              }
              if (d.low < lowestPrice) {
                  lowestPrice = d.low;
                  lowestPoint = { ...d, formattedTime };
              }
          }
      });

      console.log("[executeChartAnalysis] Price extremes in visible range:", {
          highest: { price: highestPrice, time: highestPoint?.formattedTime },
          lowest: { price: lowestPrice, time: lowestPoint?.formattedTime }
      });

      if (retryCount === 0) {
          addSystemMessage(`Submitting chart data for analysis of "${originalQuery}"...`, 'system');
      } else {
          addSystemMessage(`Re-submitting chart data (attempt ${retryCount + 1})...`, 'system');
      }

      const analysisResponse = await fetch('/api/submit-chart-context', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            chartContext: {
                symbol: chartContext.symbol,
                interval: chartContext.interval,
                visibleRange: visibleRangeStr,
                priceRange: {
                    highest: { price: highestPrice, time: highestPoint?.formattedTime },
                    lowest: { price: lowestPrice, time: lowestPoint?.formattedTime }
                },
                chartData: visibleData
            }, 
            originalQuery, 
            toolCallId,     
            toolCall,       
            originalInput, 
            model
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
          model,
          retryCount + 1              
        );
      } else if (analysisData.response) {
        console.log("[executeChartAnalysis] Received final text response.");
        addSystemMessage(analysisData.response, 'auto', analysisData.responseId); 
      } else if (analysisData.actionRequired === 'place_marker') {
        // *** HANDLE 'place_marker' received AFTER submitting context ***
        console.log("[executeChartAnalysis] Received request to place marker after context submit:", analysisData.markerArgs);
        const markerArgs = analysisData.markerArgs;
        const markerToolCallId = analysisData.toolCallId;
        const markerToolCall = analysisData.toolCall;
        const markerResponseId = analysisData.responseId; 
        // originalInput should be the same array passed into this executeChartAnalysis call

        if (chartRef.current?.placeMarker) { 
          chartRef.current.placeMarker(markerArgs);
          setState(prev => ({ ...prev, lastResponseId: markerResponseId })); 
          try {
            console.log(`[executeChartAnalysis] Confirming marker placement for call_id: ${markerToolCallId}`);
            const confirmResponse = await fetch('/api/submit-chart-context', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  chartContext: null, 
                  originalQuery: originalQuery, // Use the query passed to this function
                  toolCallId: markerToolCallId,
                  toolCall: markerToolCall,
                  originalInput: originalInput, // Use the input passed to this function
                  toolResultPayload: JSON.stringify({ status: 'success', message: 'Marker placed successfully.' }),
                  model: model // Use the model passed to this function
              })
            });
            console.log(`[executeChartAnalysis] Marker confirmation response status: ${confirmResponse.status}`);
            const confirmData = await confirmResponse.json();
            console.log("[executeChartAnalysis] Marker confirmation response data:", confirmData);
            if (!confirmResponse.ok || !confirmData.success) {
              throw new Error(confirmData.error || `Marker confirmation failed: ${confirmResponse.status}`);
            }
            if (confirmData.response) {
                addSystemMessage(confirmData.response, 'auto', confirmData.responseId);
            } else if (confirmData.actionRequired) {
                 console.warn("Confirmation triggered another action:", confirmData);
            } else {
                 console.warn("No text response after marker confirmation:", confirmData);
            }
          } catch (confirmError) {
              console.error("Error confirming marker placement within executeChartAnalysis:", confirmError);
              const errorMsg = confirmError instanceof Error ? confirmError.message : 'Failed to confirm marker placement';
              addSystemMessage(`Error after placing marker: ${errorMsg}`, 'system');
          }
        } else {
            console.error("chartRef.current.placeMarker method not found!");
            addSystemMessage("Error: Could not place marker on the chart.", 'system');
        }
      } else {
         // Now this is truly unexpected
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
    const currentModel = state.selectedModel;
    setState((prev) => ({ ...prev, isProcessing: true, lastResponseId: null }));
    addSystemMessage(`Requesting analysis: "${predefinedQuery}" using ${currentModel}`, 'system');
    const inputMessageForApi = {
      role: 'user',
      content: [{ type: 'input_text', text: predefinedQuery } as const]
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: predefinedQuery, 
            previous_response_id: null, 
            model: currentModel 
        })
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
          currentModel,
          0 
        );
      } else if (data.actionRequired === 'place_marker') {
        console.log("[handleAnalyzeChart] Received request to place marker:", data.markerArgs);
        
        // Store necessary data before potentially async operations
        const markerArgs = data.markerArgs;
        const markerToolCallId = data.toolCallId;
        const markerToolCall = data.toolCall;
        const markerResponseId = data.responseId; 
        // Need originalInput that led to this call
        const markerOriginalInput = [inputMessageForApi];

        if (chartRef.current?.placeMarker) { 
          chartRef.current.placeMarker(markerArgs);
          setState(prev => ({ ...prev, lastResponseId: markerResponseId })); // Update ID for context

          // *** Await the confirmation call to complete the tool loop ***
          try {
            console.log(`[handleAnalyzeChart] Attempting to confirm marker placement for call_id: ${markerToolCallId}`);
            const confirmResponse = await fetch('/api/submit-chart-context', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  chartContext: null, 
                  originalQuery: predefinedQuery, 
                  toolCallId: markerToolCallId,
                  toolCall: markerToolCall,
                  originalInput: markerOriginalInput,
                  // Send simple success payload for marker confirmation
                  toolResultPayload: JSON.stringify({ status: 'success', message: 'Marker placed successfully.' }),
                  model: currentModel 
              })
            });
            console.log(`[handleAnalyzeChart] Marker confirmation response status: ${confirmResponse.status}`);
            const confirmData = await confirmResponse.json();
            console.log("[handleAnalyzeChart] Marker confirmation response data:", confirmData);
            if (!confirmResponse.ok || !confirmData.success) {
              throw new Error(confirmData.error || `Marker confirmation failed: ${confirmResponse.status}`);
            }
            
            // Process the AI's response *after* confirmation
            if (confirmData.response) {
                addSystemMessage(confirmData.response, 'auto', confirmData.responseId);
            } else if (confirmData.actionRequired) {
                 // Handle unlikely case where confirmation triggers another action?
                 console.warn("Confirmation triggered another action:", confirmData);
                 // Need further logic here if this case is possible/required
            } else {
                 console.warn("No text response after marker confirmation:", confirmData);
                 // Maybe add a generic confirmation message?
                 // addSystemMessage("Marker placed.", 'system', confirmData.responseId);
            }
          } catch (confirmError) {
              console.error("Error confirming marker placement:", confirmError);
              const errorMsg = confirmError instanceof Error ? confirmError.message : 'Failed to confirm marker placement';
              addSystemMessage(`Error after placing marker: ${errorMsg}`, 'system');
              // Let finally block handle isProcessing = false
          }
        } else {
            console.error("chartRef.current.placeMarker method not found!");
            addSystemMessage("Error: Could not place marker on the chart.", 'system');
            // Let finally block handle isProcessing = false
        }
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
  }, [state.isProcessing, state.selectedModel, toast, executeChartAnalysis, chartRef]);

  // UPDATED: Handler for sending user messages
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isProcessing) return;
    console.log("[handleSendMessage] Received:", content);

    addUserMessage(content);
    const idToSend = state.lastResponseId; 
    const currentModel = state.selectedModel;
    setState((prev) => ({ ...prev, isProcessing: true }));

    const inputMessageForApi = {
      role: 'user',
      content: [{ type: 'input_text', text: content } as const]
    };

    try {
      console.log(`[handleSendMessage] Calling /api/chat... (previous_id: ${idToSend}, model: ${currentModel})`);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            content, 
            previous_response_id: idToSend, 
            model: currentModel 
        })
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
          currentModel,
          0 
        );
      } else if (data.actionRequired === 'place_marker') {
        // *** HANDLE PLACE MARKER ACTION ***
        console.log("[handleSendMessage] Received request to place marker:", data.markerArgs);
        const markerArgs = data.markerArgs;
        const markerToolCallId = data.toolCallId;
        const markerToolCall = data.toolCall;
        const markerResponseId = data.responseId; 
        const markerOriginalInput = [inputMessageForApi];

        if (chartRef.current?.placeMarker) { 
          // Place marker locally
          chartRef.current.placeMarker(markerArgs);
          setState(prev => ({ ...prev, lastResponseId: markerResponseId })); 
          
           // *** Await the confirmation call to complete the tool loop ***
           try {
             console.log(`[handleSendMessage] Attempting to confirm marker placement for call_id: ${markerToolCallId}`);
             const confirmResponse = await fetch('/api/submit-chart-context', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ 
                   chartContext: null, 
                   originalQuery: content, 
                   toolCallId: markerToolCallId,
                   toolCall: markerToolCall,
                   originalInput: markerOriginalInput,
                    // Send simple success payload for marker confirmation
                   toolResultPayload: JSON.stringify({ status: 'success', message: 'Marker placed successfully.' }),
                   model: currentModel 
               })
             });
             console.log(`[handleSendMessage] Marker confirmation response status: ${confirmResponse.status}`);
             const confirmData = await confirmResponse.json();
             console.log("[handleSendMessage] Marker confirmation response data:", confirmData);
             if (!confirmResponse.ok || !confirmData.success) {
               throw new Error(confirmData.error || `Marker confirmation failed: ${confirmResponse.status}`);
             }

             // Process the AI's response *after* confirmation
              if (confirmData.response) {
                 addSystemMessage(confirmData.response, 'auto', confirmData.responseId);
             } else if (confirmData.actionRequired) {
                  // Handle unlikely case where confirmation triggers another action?
                  console.warn("Confirmation triggered another action:", confirmData);
                  // Need further logic here if this case is possible/required
             } else {
                  console.warn("No text response after marker confirmation:", confirmData);
                  // Maybe add a generic confirmation message?
                  // addSystemMessage("Marker placed.", 'system', confirmData.responseId);
             }
           } catch (confirmError) {
               console.error("Error confirming marker placement:", confirmError);
               const errorMsg = confirmError instanceof Error ? confirmError.message : 'Failed to confirm marker placement';
               addSystemMessage(`Error after placing marker: ${errorMsg}`, 'system');
               // Let finally block handle isProcessing = false
           }      
        } else {
            console.error("chartRef.current.placeMarker method not found!");
            addSystemMessage("Error: Could not place marker on the chart.", 'system');
            // Let finally block handle isProcessing = false
        }
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
  }, [state.isProcessing, state.lastResponseId, state.selectedModel, chartRef, toast, executeChartAnalysis]);

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
          selectedModel={state.selectedModel}
          onModelChange={handleModelChange}
        />
      </div>
    </div>
  );
}; 