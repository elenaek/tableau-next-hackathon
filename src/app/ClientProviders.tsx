'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { AgentforceChat } from '@/components/AgentforceChat';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ChatProvider>
        {children}
        <AgentforceChat />
      </ChatProvider>
    </AuthProvider>
  );
}