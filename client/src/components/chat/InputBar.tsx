import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentType } from './types';

interface InputBarProps {
  onSend: (message: string) => void;
  isProcessing: boolean;
  onAnalyzeChart: () => void;
}

export const InputBar = ({ onSend, isProcessing, onAnalyzeChart }: InputBarProps) => {
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
        onClick={onAnalyzeChart}
        disabled={isProcessing}
        className="rounded-full w-8 h-8 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
        aria-label="Analyze Chart"
      >
        <Bot className="h-4 w-4 text-neutral-500" />
      </Button>

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