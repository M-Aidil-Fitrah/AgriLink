'use client';

import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

interface ChatTriggerProps {
  onClick: () => void;
  isOpen: boolean;
}

export function ChatTrigger({ onClick, isOpen }: ChatTriggerProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-brand-deep text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-emerald-900/20 transition-shadow duration-300 border border-white/10 backdrop-blur-sm"
    >
      <div className="relative">
        <Bot className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-leaf rounded-full border-2 border-brand-deep animate-pulse" />
      </div>
      <span className="font-bold uppercase tracking-[0.15em] text-xs font-sans">
        {isOpen ? 'Close' : 'AgriConsult'}
      </span>
    </motion.button>
  );
}
