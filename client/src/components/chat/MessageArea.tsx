import { Message } from './types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useRef, useEffect } from 'react';

interface MessageAreaProps {
  messages: Message[];
}

export const MessageArea = ({ messages }: MessageAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={messagesEndRef} 
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-neutral-900 min-h-0"
    >
      {messages
        .filter(message => message.type !== 'system' || !message.agent || message.agent === 'auto')
        .map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex items-start',
            message.type === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          
          <div
            className={cn(
              'rounded-lg px-3 py-2 max-w-[80%] break-words',
              message.type === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
            )}
          >
            
            <div className="mt-0">
              {typeof message.content === 'string' ? (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              ) : (
                message.content
              )}
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}; 