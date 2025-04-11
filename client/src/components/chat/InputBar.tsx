import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { ChevronDown, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AgentType } from './types';

interface InputBarProps {
  onSend: (message: string) => void;
  onAgentChange: (agent: AgentType) => void;
  selectedAgent: AgentType;
  isProcessing: boolean;
}

const agents: Array<{
  type: AgentType;
  label: string;
  description: string;
}> = [
  { type: 'auto', label: 'Auto', description: 'Automatically select the best agent' },
  { type: 'technical', label: 'Technical', description: 'Technical analysis expert' },
  { type: 'news', label: 'News', description: 'News analysis specialist' },
  { type: 'sentiment', label: 'Sentiment', description: 'Market sentiment analyst' },
  { type: 'portfolio', label: 'Portfolio', description: 'Portfolio management advisor' },
  { type: 'patterns', label: 'Patterns', description: 'Chart pattern recognition' },
];

export const InputBar = ({ onSend, onAgentChange, selectedAgent, isProcessing }: InputBarProps) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (input.trim() && !isProcessing) {
      onSend(input.trim());
      setInput('');
    }
  };

  useEffect(() => {
    if (!isProcessing) {
      setTimeout(() => {
         inputRef.current?.focus();
      }, 50);
    }
  }, [isProcessing]);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center space-x-2 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center space-x-1 rounded-full border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <span className="text-neutral-900 dark:text-neutral-100">{agents.find(a => a.type === selectedAgent)?.label || 'Auto'}</span>
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="rounded-xl w-48 mt-1 p-1">
          {agents.map((agent) => (
            <DropdownMenuItem
              key={agent.type}
              onClick={() => onAgentChange(agent.type)}
              className="flex flex-col items-start rounded-lg cursor-pointer py-2 px-3"
            >
              <span className="font-medium text-neutral-900 dark:text-neutral-100">{agent.label}</span>
              <span className="text-xs text-neutral-500">{agent.description}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ask anything..."
        className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full px-4 py-2 text-sm outline-none placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-100"
        disabled={isProcessing}
      />

      <Button
        size="icon"
        onClick={handleSend}
        disabled={!input.trim() || isProcessing}
        className="rounded-full w-8 h-8 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
      >
        <Send className="h-4 w-4 text-neutral-500" />
      </Button>
    </div>
  );
}; 