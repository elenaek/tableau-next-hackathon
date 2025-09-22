'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedChatCard } from '@/components/ui/animated-chat-card';
import {
  MessageSquareHeart,
  X,
  Minimize2,
  Maximize2,
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/app/context/ChatContext';
import { useAuth } from '@/app/context/AuthContext';
import { useChatStore } from '@/lib/stores/useChatStore';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function AgentforceChat() {
  const { authState } = useAuth();
  const {
    isOpen,
    setIsOpen,
    isMinimized,
    setIsMinimized,
    messages,
    position,
    setPosition,
    size,
    setSize,
    inputHeight,
    setInputHeight,
    input,
    setInput,
    isLoading,
    sendMessage,
    clearMessages,
    savePositionAndSize
  } = useChat();

  // Sync with Zustand store for global access
  const { isChatOpen, setChatOpen, setChatMinimized } = useChatStore();

  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingInput, setIsResizingInput] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<'tl' | 'tr' | 'bl' | 'br' | null>(null);

  const chatRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartMouse = useRef({ x: 0, y: 0 });
  const inputResizeStartHeight = useRef(0);
  const inputResizeStartY = useRef(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive, when opened, or when unminimized
  useEffect(() => {
    if (scrollAreaRef.current && isOpen && !isMinimized) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  // Auto-focus input when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Sync local state with Zustand store
  useEffect(() => {
    setChatOpen(isOpen);
  }, [isOpen, setChatOpen]);

  useEffect(() => {
    setChatMinimized(isMinimized);
  }, [isMinimized, setChatMinimized]);

  // Sync from Zustand to local state (when changed externally, e.g., from tour)
  useEffect(() => {
    if (isChatOpen !== isOpen) {
      setIsOpen(isChatOpen);
    }
  }, [isChatOpen]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
      e.preventDefault();
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStartPos.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragStartPos.current.y));
      setPosition({ x: newX, y: newY });
    }
    if (isResizing && resizeCorner) {
      const deltaX = e.clientX - resizeStartMouse.current.x;
      const deltaY = e.clientY - resizeStartMouse.current.y;

      let newWidth = resizeStartSize.current.width;
      let newHeight = resizeStartSize.current.height;
      let newX = resizeStartPos.current.x;
      let newY = resizeStartPos.current.y;

      switch (resizeCorner) {
        case 'br': // Bottom-right
          newWidth = Math.max(300, Math.min(window.innerWidth - position.x - 20, resizeStartSize.current.width + deltaX));
          newHeight = Math.max(400, Math.min(window.innerHeight - position.y - 50, resizeStartSize.current.height + deltaY));
          break;
        case 'bl': // Bottom-left
          newWidth = Math.max(300, Math.min(resizeStartPos.current.x + resizeStartSize.current.width, resizeStartSize.current.width - deltaX));
          newHeight = Math.max(400, Math.min(window.innerHeight - position.y - 50, resizeStartSize.current.height + deltaY));
          newX = Math.max(0, resizeStartPos.current.x + deltaX);
          break;
        case 'tr': // Top-right
          newWidth = Math.max(300, Math.min(window.innerWidth - position.x - 20, resizeStartSize.current.width + deltaX));
          newHeight = Math.max(400, Math.min(resizeStartPos.current.y + resizeStartSize.current.height, resizeStartSize.current.height - deltaY));
          newY = Math.max(0, resizeStartPos.current.y + deltaY);
          break;
        case 'tl': // Top-left
          newWidth = Math.max(300, Math.min(resizeStartPos.current.x + resizeStartSize.current.width, resizeStartSize.current.width - deltaX));
          newHeight = Math.max(400, Math.min(resizeStartPos.current.y + resizeStartSize.current.height, resizeStartSize.current.height - deltaY));
          newX = Math.max(0, resizeStartPos.current.x + deltaX);
          newY = Math.max(0, resizeStartPos.current.y + deltaY);
          break;
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    }
    if (isResizingInput) {
      const deltaY = inputResizeStartY.current - e.clientY;
      const newHeight = Math.max(60, Math.min(300, inputResizeStartHeight.current + deltaY));
      setInputHeight(newHeight);
    }
  }, [isDragging, isResizing, isResizingInput, position, resizeCorner, setPosition, setSize, setInputHeight]);

  const handleMouseUp = useCallback(() => {
    // Save position and size when user releases the mouse
    if (isDragging || isResizing || isResizingInput) {
      savePositionAndSize();
    }
    setIsDragging(false);
    setIsResizing(false);
    setIsResizingInput(false);
    setResizeCorner(null);
  }, [isDragging, isResizing, isResizingInput, savePositionAndSize]);

  // Set up global mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing || isResizingInput) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, isResizingInput, handleMouseMove, handleMouseUp]);

  // Handle resize
  const handleResizeStart = (corner: 'tl' | 'tr' | 'bl' | 'br') => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeCorner(corner);
    resizeStartSize.current = { width: size.width, height: size.height };
    resizeStartPos.current = { x: position.x, y: position.y };
    resizeStartMouse.current = { x: e.clientX, y: e.clientY };
  };

  // Handle input resize
  const handleInputResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingInput(true);
    inputResizeStartHeight.current = inputHeight;
    inputResizeStartY.current = e.clientY;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Don't render the chat if user is not authenticated
  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Collapsed Tab */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            exit={{ x: 100 }}
            className="fixed top-1/8 z-50 agentforce-chat-section-tab"
            style={{ right: '15px' }}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
              className="cursor-pointer rounded-l-lg rounded-r-none h-36 px-3 py-1 bg-indigo-500 hover:bg-indigo-900 text-white shadow-lg hover:scale-102 active:scale-98"
              size="lg"
            >
              <div className="flex flex-col items-center gap-2">
                <MessageSquareHeart className="h-5 w-5" />
                <span className="text-xs font-medium writing-mode-vertical pb-1">Agentforce Chat</span>
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatRef}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              width: size.width,
              height: isMinimized ? 50 : size.height,
              zIndex: 9999,
            }}
            className={cn(
              "transition-opacity duration-200 agentforce-chat-section-expanded-window",
              !isFocused && !isHovered && !isDragging && !isResizing ? "opacity-40" : "opacity-100"
            )}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <AnimatedChatCard className="w-full h-full p-[1px]">
              <Card className="w-full h-full flex flex-col border relative rounded-xl">
                {/* Header */}
                <div className={cn(
                  "drag-handle flex items-center justify-between p-2 cursor-move bg-gradient-to-r from-purple-50 to-indigo-100 relative",
                  isMinimized ? "rounded-xl border" : "rounded-t-xl border-b"
                )}>
                  {/* Top resize handles - in header */}
                  {/* Top-left */}
                  <div
                    className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50"
                    onMouseDown={handleResizeStart('tl')}
                    style={{ touchAction: 'none' }}
                  />
                  {/* Top-right */}
                  <div
                    className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-50"
                    onMouseDown={handleResizeStart('tr')}
                    style={{ touchAction: 'none' }}
                  />

                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-pink-400"/>
                    <h3 className="font-semibold text-sm">Agentforce Health Assistant</h3>
                    <span className="text-xs text-muted-foreground">HIPAA Compliant with Agentforce</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 cursor-pointer hover:scale-110 active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearMessages();
                      }}
                      title="Clear chat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 cursor-pointer hover:scale-110 active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMinimized(!isMinimized);
                        setIsFocused(false);
                      }}
                    >
                      {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 cursor-pointer hover:scale-115 active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Chat Content */}
                {!isMinimized && (
                  <div className="flex-1 flex flex-col relative overflow-hidden">
                    <div ref={scrollAreaRef} className="flex-1 p-4 overflow-y-auto min-h-0">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex gap-3",
                              message.role === 'user' ? "justify-end" : "justify-start"
                            )}
                          >
                            {message.role === 'assistant' && (
                              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                                <Bot className="h-4 w-4 text-pink-300" />
                              </div>
                            )}
                            <div
                              className={cn(
                                "max-w-[75%] rounded-lg px-4 py-2",
                                message.role === 'user'
                                  ? "bg-blue-500 text-white"
                                  : "bg-indigo-100 text-foreground"
                              )}
                            >
                              <Markdown remarkPlugins={[remarkGfm]}
                                  components={{
                                    h1: ({ children }) => <h1 className="mb-2 last:mb-0 text-xl font-bold">{children}</h1>,
                                    h2: ({ children }) => <h2 className="mb-2 last:mb-0 text-lg font-semibold">{children}</h2>,
                                    h3: ({ children }) => <h3 className="mb-2 last:mb-0 text-base font-semibold">{children}</h3>,
                                    p: ({ children }) => <p className="mb-2 last:mb-0 text-sm">{children}</p>,
                                    ul: ({ children }) => <ul className="mb-2 ml-4 list-disc last:mb-0 text-sm">{children}</ul>,
                                    ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal last:mb-0 text-sm">{children}</ol>,
                                    li: ({ children }) => <li className="mb-1">{children}</li>,
                                  }}
                              >
                                {message.content}
                              </Markdown>
                              <p className={cn(
                                "text-xs mt-1",
                                message.role === 'user' ? "text-blue-100" : "text-muted-foreground"
                              )}>
                                {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {message.role === 'user' && (
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                            )}
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-pink-300" />
                            </div>
                            <div className="bg-gray-100 rounded-lg px-4 py-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Disclaimer */}
                    <div className="px-3 py-1 bg-gray-50/50">
                      <div className="flex items-start gap-1.5">
                        <Info className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] text-gray-500 leading-relaxed italic">
                          AI responses may contain inaccuracies. Always double-check and consult your healthcare team for medical advice.
                        </p>
                      </div>
                    </div>

                    {/* Input Area */}
                    <div className="border-t flex-shrink-0 relative" style={{ height: `${inputHeight}px` }}>
                      {/* Input resize handle */}
                      <div
                        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-gray-200/50 z-10"
                        onMouseDown={handleInputResizeStart}
                      >
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-400 rounded-full" />
                      </div>

                      <div className="flex gap-2 h-full p-3">
                        <textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          placeholder="Ask about your medical records, treatment, or health..."
                          className="flex-1 resize-none p-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          disabled={isLoading}
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={isLoading || !input.trim()}
                          size="sm"
                          className="px-3 self-end cursor-pointer hover:scale-110 active:scale-95"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Bottom Resize Handles - in content area */}
                    {/* Bottom-left */}
                    <div
                      className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50"
                      onMouseDown={handleResizeStart('bl')}
                      style={{ touchAction: 'none' }}
                    />
                    {/* Bottom-right */}
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
                      onMouseDown={handleResizeStart('br')}
                      style={{ touchAction: 'none' }}
                    />
                  </div>
                )}
              </Card>
            </AnimatedChatCard>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .writing-mode-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </>
  );
}