'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { NotificationProvider } from './context/NotificationContext';
import { AgentforceChat } from '@/components/AgentforceChat';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          {children}
          <AgentforceChat />
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}