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
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex items-start space-x-4',
            message.type === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          {message.type === 'system' && message.agent && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
              {message.agent.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div
            className={cn(
              'rounded-2xl px-4 py-2 max-w-[80%] shadow-sm',
              message.type === 'user'
                ? 'bg-neutral-100 dark:bg-neutral-800'
                : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800'
            )}
          >
            <div className="flex items-center space-x-2">
              {message.type === 'system' && message.agent && (
                <span className="text-xs font-medium text-neutral-500">
                  {message.agent}
                </span>
              )}
              <span className="text-xs text-neutral-400">
                {format(message.timestamp, 'HH:mm')}
              </span>
            </div>
            
            <div className="mt-1">
              {typeof message.content === 'string' ? (
                <p className="text-sm text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap">{message.content}</p>
              ) : (
                message.content
              )}
            </div>

            {message.metadata?.command && (
              <div className="mt-2 text-xs text-neutral-500">
                Command: {message.metadata.command}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 