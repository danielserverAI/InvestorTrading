import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Bot, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TextareaAutosize from 'react-textarea-autosize';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AgentType } from './types';

// Define available models
const AVAILABLE_MODELS = ['gpt-4o', 'gpt-4o-mini'];

interface InputBarProps {
  onSend: (message: string) => void;
  isProcessing: boolean;
  onAnalyzeChart: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export const InputBar = ({ onSend, isProcessing, onAnalyzeChart, selectedModel, onModelChange }: InputBarProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !isProcessing) {
      onSend(input.trim());
      setInput('');
    }
  };

  useEffect(() => {
    if (!isProcessing && textareaRef.current) {
      textareaRef.current.focus({ preventScroll: true });
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isProcessing]);

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end space-x-2 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
      <TextareaAutosize
        ref={textareaRef}
        rows={1}
        maxRows={5}
        value={input}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Ask anything..."
        className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-4 py-2 text-sm outline-none placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-100 resize-none border border-neutral-200 dark:border-neutral-700 focus:ring-0 min-h-[36px] max-h-[120px]"
        disabled={isProcessing}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isProcessing}>
          <Button 
             variant="ghost"
             size="sm" 
             className="h-9 w-[120px] justify-between text-xs px-2 flex-shrink-0 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            {selectedModel}
            <ChevronsUpDown className="h-3 w-3 opacity-50 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[120px]" align="end">
          {AVAILABLE_MODELS.map((model) => (
            <DropdownMenuItem
              key={model}
              onSelect={() => onModelChange(model)}
              className="text-xs"
            >
              {model}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        size="icon"
        variant="ghost"
        onClick={onAnalyzeChart}
        disabled={isProcessing}
        className="rounded-full w-9 h-9 flex-shrink-0 hover:bg-neutral-200 dark:hover:bg-neutral-700"
        aria-label="Analyze Chart"
      >
        <Bot className="h-4 w-4 text-neutral-500" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={handleSend}
        disabled={!input.trim() || isProcessing}
        className="rounded-full w-9 h-9 flex-shrink-0 hover:bg-neutral-200 dark:hover:bg-neutral-700"
      >
        <Send className="h-4 w-4 text-neutral-500" />
      </Button>
    </div>
  );
}; 