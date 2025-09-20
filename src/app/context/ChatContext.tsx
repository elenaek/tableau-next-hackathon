'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { LOCAL_STORAGE_KEYS } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatPosition {
  x: number;
  y: number;
}

interface ChatSize {
  width: number;
  height: number;
}

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  isMinimized: boolean;
  setIsMinimized: (value: boolean) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  position: ChatPosition;
  setPosition: (value: ChatPosition) => void;
  size: ChatSize;
  setSize: (value: ChatSize) => void;
  inputHeight: number;
  setInputHeight: (value: number) => void;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  sendMessage: () => Promise<void>;
  clearMessages: () => void;
  savePositionAndSize: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  // Load saved state from localStorage
  const getSavedState = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CHAT_STATE);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing chat state:', e);
        }
      }
    }
    return null;
  };

  const savedState = getSavedState();

  const [isOpen, setIsOpen] = useState(savedState?.isOpen || false);
  const [isMinimized, setIsMinimized] = useState(savedState?.isMinimized || false);
  const [messages, setMessages] = useState<Message[]>(savedState?.messages || [
    {
      id: '1',
      content: "Hello! I'm your AI healthcare assistant. I can help you understand your medical records, treatment progress, and answer questions about your care. How can I assist you today?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Position and size states with saved values
  const [position, setPosition] = useState<ChatPosition>(
    savedState?.position || { x: 0, y: 100 }
  );
  const [size, setSize] = useState<ChatSize>(
    savedState?.size || { width: 400, height: 500 }
  );
  const [inputHeight, setInputHeight] = useState(savedState?.inputHeight || 80);

  // Initialize position on client side if not loaded from storage
  useEffect(() => {
    if (typeof window !== 'undefined' && !savedState?.position) {
      setPosition({ x: window.innerWidth - 420, y: 100 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save position and size manually (called on mouse release)
  const savePositionAndSize = useCallback(() => {
    const state = {
      isOpen,
      isMinimized,
      position,
      size,
      inputHeight,
      messages: messages.slice(-20) // Keep last 20 messages to avoid storage limits
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.CHAT_STATE, JSON.stringify(state));
  }, [isOpen, isMinimized, position, size, inputHeight, messages]);

  // Save immediately when open/minimized/messages change (but NOT position/size/inputHeight)
  useEffect(() => {
    const state = {
      isOpen,
      isMinimized,
      position,
      size,
      inputHeight,
      messages: messages.slice(-20) // Keep last 20 messages to avoid storage limits
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.CHAT_STATE, JSON.stringify(state));
  }, [isOpen, isMinimized, messages, position, size, inputHeight]); // Note: position, size, and inputHeight are NOT in deps for immediate save

  // Get patient context from localStorage
  const getPatientContext = () => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.PATIENT_DATA_CACHE);
      if (cached) {
        const patientData = JSON.parse(cached);
        return {
          name: patientData.name,
          diagnosis: patientData.diagnosis,
          department: patientData.department,
          treatmentStatus: patientData.treatmentStatus,
          treatmentProgress: patientData.treatmentProgress,
          providerNotes: patientData.providerNotes,
          admissionDate: patientData.admissionDate,
          lengthOfStay: patientData.lengthOfStay,
          physician: patientData.physician,
          roomNumber: patientData.roomNumber
        };
      }
    } catch (error) {
      console.error('Error getting patient context:', error);
    }
    return null;
  };

  // Clear all messages and reset to initial state
  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: '1',
        content: "Hello! I'm your AI healthcare assistant. I can help you understand your medical records, treatment progress, and answer questions about your care. How can I assist you today?",
        role: 'assistant',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Send message to Agentforce
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const patientContext = getPatientContext();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          patientContext,
          conversationHistory: messages.slice(-5) // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.insight,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isOpen,
    setIsOpen,
    isMinimized,
    setIsMinimized,
    messages,
    setMessages,
    position,
    setPosition,
    size,
    setSize,
    inputHeight,
    setInputHeight,
    input,
    setInput,
    isLoading,
    setIsLoading,
    sendMessage,
    clearMessages,
    savePositionAndSize
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}