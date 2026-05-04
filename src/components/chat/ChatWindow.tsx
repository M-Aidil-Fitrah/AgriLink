'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, Loader2 } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { ChatMessage } from './ChatMessage';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  // Manual input state for AI SDK 6.0 compatibility
  const [input, setInput] = useState('');
  
  const { 
    messages, 
    sendMessage,
    status 
  } = useChat({
    // In SDK 6.0, 'initialMessages' is now 'messages' in the options object
    messages: [
      {
        id: '1',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Halo! Saya AgriConsult. Ada yang bisa saya bantu terkait pertanian hari ini?' }],
      } as UIMessage
    ],
  });

  const isStreaming = status === 'streaming';
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const currentInput = input;
    setInput('');

    // Type-safe message submission following UIMessage structure
    await sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: currentInput }],
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 right-6 z-50 w-[400px] max-h-[600px] h-[70vh] bg-white border border-black/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header Editorial */}
          <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-brand-deep rounded-full flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-brand-leaf rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-deep leading-none mb-1">
                  AgriConsult
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-brand-leaf rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-brand-leaf uppercase tracking-widest">
                    Live
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-brand-deep opacity-40" />
              </button>
            </div>
          </div>

          {/* Messages Area - High Whitespace */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar bg-[#fcfcfc]"
          >
            {messages.map((msg: UIMessage) => {
              // Extract text content from multimodal parts in v6.0
              const textContent = msg.parts
                .filter(part => part.type === 'text')
                .map(part => (part as any).text || '')
                .join('\n');

              return (
                <ChatMessage 
                  key={msg.id} 
                  message={{
                    id: msg.id,
                    role: msg.role as any,
                    content: textContent,
                    timestamp: new Date(),
                  }} 
                />
              );
            })}
            {isStreaming && messages[messages.length - 1]?.role === 'user' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start mb-6"
              >
                <div className="bg-brand-offwhite px-4 py-3 rounded-2xl rounded-bl-none border border-black/5">
                  <Loader2 className="w-4 h-4 text-brand-leaf animate-spin" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-black/5">
            <form 
              onSubmit={handleFormSubmit}
              className="relative flex items-center bg-brand-offwhite rounded-2xl border border-black/5 focus-within:border-brand-leaf/30 transition-colors duration-300"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan sesuatu..."
                className="w-full bg-transparent px-5 py-4 text-sm text-brand-deep placeholder:text-brand-deep/30 outline-none font-medium tracking-tight"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isStreaming}
                className={cn(
                  "mr-3 p-2 rounded-xl transition-all duration-300",
                  input.trim() && !isStreaming
                    ? "bg-brand-deep text-white shadow-lg shadow-brand-deep/20" 
                    : "bg-transparent text-brand-deep opacity-20"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="mt-4 text-[10px] text-center text-brand-deep opacity-20 uppercase tracking-[0.2em] font-bold">
              Powered by AgriLink Intelligence
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
