'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, Loader2 } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { ChatMessage } from './ChatMessage';
import { cn } from '@/lib/utils';

import { ProductCardChat } from './ProductCardChat';
import { StoreCardChat } from './StoreCardChat';

// Define strict types for 100% Type Safety
interface TextPart {
  type: 'text';
  text: string;
}

interface ToolPart {
  type: string; // SDK version uses 'tool-call' | 'tool-result' prefix
  toolCallId: string;
  toolName: string;
  state: 'call' | 'result';
  result?: unknown;
}



interface Store {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    sendMessage,
    status 
  } = useChat({
    messages: [
      {
        id: '1',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Halo! Saya AgriConsult. Ada yang bisa saya bantu terkait pertanian hari ini?' }],
      } as UIMessage
    ],
  });

  // Geolocation Intelligence
  useEffect(() => {
    if (isOpen && "geolocation" in navigator && !location) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation access denied:", error.message);
        }
      );
    }
  }, [isOpen, location]);

  const isStreaming = status === 'streaming';

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

    await sendMessage(
      {
        role: 'user',
        parts: [{ type: 'text', text: currentInput }],
      },
      {
        body: { location }
      }
    );
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
                    {location ? 'Live • Connected' : 'Live'}
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

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar bg-[#fcfcfc]"
          >
            {messages.map((msg: UIMessage) => (
              <div key={msg.id} className="flex flex-col">
                {msg.parts.map((part, partIdx) => {
                  // Strict type narrowing without 'any'
                  if (part.type === 'text') {
                    const p = part as unknown as TextPart;
                    return (
                      <ChatMessage 
                        key={`${msg.id}-text-${partIdx}`} 
                        message={{
                          id: msg.id,
                          role: msg.role as 'user' | 'assistant',
                          content: p.text,
                          timestamp: new Date(),
                        }} 
                      />
                    );
                  }

                  if (part.type.startsWith('tool-')) {
                    const p = part as unknown as ToolPart;
                    const { toolName, state, result, toolCallId } = p;

                    if (state === 'result' && result) {
                      if (toolName === 'searchProducts' || toolName === 'getProductDetail') {
                        const products = Array.isArray(result) ? result : [result];
                        return <ProductCardChat key={toolCallId} products={products} />;
                      }
                      
                      if (toolName === 'findNearbyProducts') {
                        const stores = result as Store[];
                        return <StoreCardChat key={toolCallId} stores={stores} />;
                      }
                    }

                    if (state === 'call') {
                      return (
                        <div key={toolCallId} className="flex items-center gap-2 p-3 bg-brand-offwhite rounded-2xl border border-black/5 mb-4 max-w-[80%]">
                          <Loader2 className="w-3 h-3 animate-spin text-brand-leaf" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-deep/40">
                            Mengambil Data...
                          </span>
                        </div>
                      );
                    }
                  }
                  
                  return null;
                })}
              </div>
            ))}
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
