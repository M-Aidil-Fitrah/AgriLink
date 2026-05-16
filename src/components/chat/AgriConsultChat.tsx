'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChatTrigger } from './ChatTrigger';
import { ChatWindow } from './ChatWindow';

export function AgriConsultChat() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hide on auth pages and landing page
  const isHiddenPage = 
    pathname === '/' || 
    pathname?.startsWith('/login') || 
    pathname?.startsWith('/register');

  // Always render ChatWindow so its hooks (useChat, useState, useEffect)
  // are never conditionally mounted — avoids React error #310.
  // Visibility is controlled internally by the isOpen prop.
  if (isHiddenPage) return null;

  return (
    <>
      <ChatTrigger 
        isOpen={isOpen} 
        onClick={() => setIsOpen(!isOpen)} 
      />
      <ChatWindow 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
