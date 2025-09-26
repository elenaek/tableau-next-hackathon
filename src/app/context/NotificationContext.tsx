'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FloatingNotification } from '@/components/ui/floating-notification';

interface NotificationContextType {
  showNotification: (title: string, description: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    description: string;
    type: 'success' | 'info' | 'warning' | 'error';
  }>({
    show: false,
    title: '',
    description: '',
    type: 'info',
  });

  const showNotification = (
    title: string,
    description: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ) => {
    setNotification({
      show: true,
      title,
      description,
      type,
    });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <FloatingNotification
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
        title={notification.title}
        description={notification.description}
        type={notification.type}
        duration={6000}
      />
    </NotificationContext.Provider>
  );
}