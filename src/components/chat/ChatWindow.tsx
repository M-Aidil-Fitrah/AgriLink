'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { type ChatMessage as ChatMessageType } from './types';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Halo! Saya AgriConsult. Ada yang bisa saya bantu terkait pertanian hari ini?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newUserMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');

    // Simulate AI response for UI demo
    setTimeout(() => {
      const aiResponse: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Terima kasih atas pertanyaannya. Sebagai AI AgriConsult, saya sedang mempelajari data terbaru untuk memberikan saran terbaik bagi Anda.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
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
                  <Bot className="w-4 h-4" />
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
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-black/5">
            <div className="relative flex items-center bg-brand-offwhite rounded-2xl border border-black/5 focus-within:border-brand-leaf/30 transition-colors duration-300">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tanyakan sesuatu..."
                className="w-full bg-transparent px-5 py-4 text-sm text-brand-deep placeholder:text-brand-deep/30 outline-none font-medium tracking-tight"
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className={cn(
                  "mr-3 p-2 rounded-xl transition-all duration-300",
                  inputValue.trim() 
                    ? "bg-brand-deep text-white shadow-lg shadow-brand-deep/20" 
                    : "bg-transparent text-brand-deep opacity-20"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-4 text-[10px] text-center text-brand-deep opacity-20 uppercase tracking-[0.2em] font-bold">
              Powered by AgriLink Intelligence
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
