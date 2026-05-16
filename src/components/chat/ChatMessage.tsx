'use client';

import { motion } from 'framer-motion';
import { type ChatMessage as ChatMessageType } from './types';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { seenMessageIds } from './ChatWindow';

interface ChatMessageProps {
  message: ChatMessageType;
  animateOnMount?: boolean;
}

export function ChatMessage({ message, animateOnMount = true }: ChatMessageProps) {
  const isAI = message.role === 'assistant';
  
  // Decide ONCE upon mount if this message should be animated.
  const [shouldAnimate] = useState(() => {
    if (!isAI) return false;
    return animateOnMount;
  });

  // Mark this message as seen so it won't animate again if re-mounted (e.g., closing and reopening chat)
  useEffect(() => {
    seenMessageIds.add(message.id);
  }, [message.id]);

  const [displayedContent, setDisplayedContent] = useState('');
  const contentRef = useRef(message.content);

  // Sync ref with actual content from stream
  useEffect(() => {
    contentRef.current = message.content;
  }, [message.content]);

  // Typewriter effect (word-by-word)
  useEffect(() => {
    if (!shouldAnimate) return; // Only run typewriter for new AI messages

    const interval = setInterval(() => {
      setDisplayedContent((prev) => {
        const target = contentRef.current;
        if (prev.length < target.length) {
          let nextIndex = prev.length;
          
          // Skip any leading spaces
          while (nextIndex < target.length && (target[nextIndex] === ' ' || target[nextIndex] === '\n')) {
            nextIndex++;
          }
          
          // Find the next boundary
          while (nextIndex < target.length && target[nextIndex] !== ' ' && target[nextIndex] !== '\n') {
            nextIndex++;
          }
          
          return target.slice(0, nextIndex);
        }
        return prev;
      });
    }, 45); // Delay between words

    return () => clearInterval(interval);
  }, [shouldAnimate]);

  // Direct render for user messages or old AI messages, animated render for new AI messages
  const finalContent = shouldAnimate ? displayedContent : message.content;
  const hasCursor = shouldAnimate && finalContent.length < message.content.length;
  
  // Append a block character as the cursor to blend naturally with markdown parsing
  const renderContent = finalContent + (hasCursor ? ' ▋' : '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20 
      }}
      className={cn(
        "flex w-full mb-6",
        isAI ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] px-5 py-3 text-sm leading-relaxed shadow-sm min-h-[44px]",
          isAI 
            ? "bg-brand-offwhite text-brand-deep rounded-2xl rounded-bl-none border border-black/5" 
            : "bg-brand-deep text-white rounded-2xl rounded-br-none"
        )}
        style={{
          borderBottomLeftRadius: isAI ? '2px' : '16px',
          borderBottomRightRadius: isAI ? '16px' : '2px',
        }}
      >
        <div className={cn(
          "tracking-tight break-words", 
          isAI ? "text-brand-deep" : "text-white"
        )}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed font-medium" {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 last:mb-0 space-y-1 font-medium" {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 last:mb-0 space-y-1 font-medium" {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              li: ({ node, ...props }) => <li className="pl-1" {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              strong: ({ node, ...props }) => <strong className={cn("font-bold", isAI ? "text-brand-leaf" : "text-emerald-200")} {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              a: ({ node, ...props }) => <a className={cn("underline font-bold", isAI ? "text-brand-leaf hover:text-brand-deep" : "text-emerald-200 hover:text-white")} target="_blank" rel="noopener noreferrer" {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0" {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0" {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-2 mt-3 first:mt-0" {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              pre: ({ node, ...props }) => <pre className="bg-black/5 rounded p-2 my-2 font-mono text-xs overflow-x-auto" {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              code: ({ node, ...props }) => <code className="bg-black/5 rounded px-1 py-0.5 font-mono text-xs" {...props} />,
            }}
          >
            {renderContent}
          </ReactMarkdown>
        </div>
        <span className={cn(
          "text-[10px] mt-1 block opacity-40 uppercase tracking-widest font-bold",
          isAI ? "text-brand-deep" : "text-white"
        )}>
          {isAI ? 'AgriConsult' : 'You'} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}



