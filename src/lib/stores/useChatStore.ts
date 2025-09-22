import { create } from 'zustand';

interface ChatStore {
  isChatOpen: boolean;
  isChatMinimized: boolean;
  setChatOpen: (open: boolean) => void;
  setChatMinimized: (minimized: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isChatOpen: false,
  isChatMinimized: false,
  setChatOpen: (open) => set({ isChatOpen: open }),
  setChatMinimized: (minimized) => set({ isChatMinimized: minimized }),
}));