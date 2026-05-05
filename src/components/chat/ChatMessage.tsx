'use client';

import { motion } from 'framer-motion';
import { type ChatMessage as ChatMessageType } from './types';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.role === 'assistant';

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
          "max-w-[85%] px-5 py-3 text-sm leading-relaxed shadow-sm",
          isAI 
            ? "bg-brand-offwhite text-brand-deep rounded-2xl rounded-bl-none border border-black/5" 
            : "bg-brand-deep text-white rounded-2xl rounded-br-none"
        )}
        style={{
          // Custom asymmetric radii as per instructions: 12px but sharp at the tail
          borderBottomLeftRadius: isAI ? '2px' : '16px',
          borderBottomRightRadius: isAI ? '16px' : '2px',
        }}
      >
        <p className="font-medium tracking-tight">
          {message.content}
        </p>
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
