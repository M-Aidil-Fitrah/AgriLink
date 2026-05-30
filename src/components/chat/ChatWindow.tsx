'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, Loader2 } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { ChatMessage } from './ChatMessage';
import { cn } from '@/lib/utils';
import { ProductCardChat } from './ProductCardChat';
import { StoreCardChat } from './StoreCardChat';

// --- Strict Type Definitions (Zero Any, AI SDK v6 / @ai-sdk/react v3) ---

interface TextPart {
  type: 'text';
  text: string;
}

interface ToolPart {
  type: string;
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

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  productCategory: string;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

// Create transport once at module level — never recreate on each render
// to avoid destabilizing useChat's internal hooks (React error #310)
const chatTransport = new TextStreamChatTransport({ api: '/api/chat' });

const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    parts: [{ type: 'text', text: 'Halo! Saya AgriConsult. Ada yang bisa saya bantu terkait pertanian hari ini?' }],
  } as UIMessage,
];

// Module-level set to track which messages have already been animated.
// This avoids reading mutable React refs during the render phase (which violates React strict mode).
export const seenMessageIds = new Set<string>(INITIAL_MESSAGES.map((m) => m.id));


export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Artificial thinking state (min 3 seconds delay)
  const [artificialThinking, setArtificialThinking] = useState(false);
  const [thinkingUntil, setThinkingUntil] = useState<number>(0);

  // Stable timestamps for messages
  const [msgTimes, setMsgTimes] = useState<Record<string, Date>>({
    welcome: new Date(),
  });

  const { messages, sendMessage, status } = useChat({
    transport: chatTransport,
    messages: INITIAL_MESSAGES,
  });

  // Geolocation Service
  useEffect(() => {
    if (isOpen && 'geolocation' in navigator && !location) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => console.warn('Location error:', error.message)
      );
    }
  }, [isOpen, location]);

  const isStreaming = status === 'streaming';

  // Artificial thinking timer
  useEffect(() => {
    if (artificialThinking) {
      const remaining = thinkingUntil - Date.now();
      if (remaining > 0) {
        const timer = setTimeout(() => {
          setArtificialThinking(false);
        }, remaining);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setArtificialThinking(false);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [artificialThinking, thinkingUntil]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, artificialThinking]); // also scroll when artificial thinking changes

  // Update stable timestamps when new messages arrive
  useEffect(() => {
    let hasNew = false;
    const updatedTimes = { ...msgTimes };
    messages.forEach((m) => {
      if (!updatedTimes[m.id]) {
        updatedTimes[m.id] = new Date();
        hasNew = true;
      }
    });
    if (hasNew) {
      const timer = setTimeout(() => {
        setMsgTimes(updatedTimes);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [messages, msgTimes]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || artificialThinking) return;

    const currentInput = input;
    setInput('');

    // Force a minimum 3 seconds "thinking" animation
    setThinkingUntil(Date.now() + 3000);
    setArtificialThinking(true);

    await sendMessage(
      {
        role: 'user',
        parts: [{ type: 'text', text: currentInput }],
      } as UIMessage,
      { body: { location } }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 z-50 w-auto sm:w-[400px] max-h-[600px] h-[70vh] bg-white border border-black/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
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
                <span className="text-[10px] font-bold text-brand-leaf uppercase tracking-widest">
                  {location ? 'Live • Connected' : 'Live'}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <X className="w-4 h-4 text-brand-deep opacity-40" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#fcfcfc]">
            {messages.map((msg: UIMessage, index: number) => {
              // Hide the latest AI message while artificial 3-second thinking is active
              const isLatestAssistant = msg.role === 'assistant' && index === messages.length - 1;
              const isActivelyThinking = artificialThinking && isLatestAssistant;

              if (isActivelyThinking) return null;

              return (
                <div key={msg.id} className="flex flex-col gap-2">
                  {msg.parts && msg.parts.length > 0 && msg.parts.map((part, partIdx) => {
                    if (part.type === 'text') {
                      const p = part as unknown as TextPart;
                      // Do not render empty text bubbles
                      if (!p.text) return null;
                      
                      return (
                        <ChatMessage
                          key={`${msg.id}-text-${partIdx}`}
                          message={{
                            id: msg.id,
                            role: msg.role as 'user' | 'assistant',
                            content: p.text,
                            timestamp: msgTimes[msg.id] || new Date(),
                          }}
                          animateOnMount={!seenMessageIds.has(msg.id)}
                        />
                      );
                    }

                    if (part.type.startsWith('tool-')) {
                      const p = part as unknown as ToolPart;
                      const { toolName, state, result, toolCallId } = p;

                      if (state === 'result' && result) {
                        if (toolName === 'searchProducts' || toolName === 'getProductDetail') {
                          const products = Array.isArray(result) ? (result as Product[]) : [result as Product];
                          return <ProductCardChat key={toolCallId} products={products} />;
                        }
                        if (toolName === 'findNearbyProducts') {
                          return <StoreCardChat key={toolCallId} stores={result as Store[]} />;
                        }
                      }

                      if (state === 'call') {
                        return (
                          <div key={toolCallId} className="flex items-center gap-2 p-3 bg-brand-offwhite rounded-2xl border border-black/5 mb-4 max-w-[80%]">
                            <Loader2 className="w-3 h-3 animate-spin text-brand-leaf" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-deep/40">
                              Mencari data...
                            </span>
                          </div>
                        );
                      }
                    }
                    return null;
                  })}
                </div>
              );
            })}

            {(artificialThinking || (isStreaming && (() => {
              const lastMsg = messages[messages.length - 1];
              if (!lastMsg) return false;
              
              // Only show thinking indicator if the last message is assistant
              // and it has no text content and no tool calls yet
              if (lastMsg.role === 'assistant') {
                const hasText = lastMsg.parts?.some(p => p.type === 'text' && (p as unknown as TextPart).text.length > 0);
                const hasToolCall = lastMsg.parts?.some(p => p.type.startsWith('tool-'));
                return !hasText && !hasToolCall;
              }
              return false;
            })() )) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-4"
              >
                <div className="bg-brand-offwhite px-4 py-3.5 rounded-2xl rounded-bl-none border border-black/5 flex items-center gap-1.5 shadow-sm">
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-1.5 h-1.5 bg-brand-leaf rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                    className="w-1.5 h-1.5 bg-brand-leaf/80 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                    className="w-1.5 h-1.5 bg-brand-leaf/50 rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
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
                className="w-full bg-transparent px-5 py-4 text-sm text-brand-deep outline-none font-medium tracking-tight placeholder:text-brand-deep/30"
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming || artificialThinking}
                className={cn(
                  'mr-3 p-2 rounded-xl transition-all duration-300',
                  input.trim() && !isStreaming && !artificialThinking
                    ? 'bg-brand-deep text-white shadow-lg'
                    : 'bg-transparent text-brand-deep opacity-20'
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
