import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface User {
  userID: string;
  username: string;
  avatar: string;
  points: number;
}

export interface Message {
  messageID: string;
  userID: string;
  username: string;
  avatar: string;
  text: string;
  encryptedContent?: string;
  timestamp: number;
  replyToMessageID?: string;
  reactions: Record<string, string[]>; // emoji -> userIDs
}

export interface GroupChat {
  groupID: string;
  name: string;
  description: string;
  memberCount: number;
  lastMessage?: string;
  lastMessageTime?: number;
}

export interface ChatState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Chat state
  groupChats: GroupChat[];
  currentGroupID: string | null;
  messages: Record<string, Message[]>; // groupID -> messages
  
  // Leaderboard
  leaderboard: User[];
  
  // UI state
  typingUsers: Record<string, string[]>; // groupID -> usernames
  isConnected: boolean;
  
  // Actions
  setUser: (user: User) => void;
  logout: () => void;
  setGroupChats: (chats: GroupChat[]) => void;
  setCurrentGroup: (groupID: string | null) => void;
  addMessage: (groupID: string, message: Message) => void;
  updateMessage: (groupID: string, messageID: string, updates: Partial<Message>) => void;
  setMessages: (groupID: string, messages: Message[]) => void;
  setLeaderboard: (leaderboard: User[]) => void;
  setTypingUsers: (groupID: string, usernames: string[]) => void;
  setConnectionStatus: (isConnected: boolean) => void;
  
  // Message reactions
  addReaction: (groupID: string, messageID: string, emoji: string, userID: string) => void;
  removeReaction: (groupID: string, messageID: string, emoji: string, userID: string) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        groupChats: [],
        currentGroupID: null,
        messages: {},
        leaderboard: [],
        typingUsers: {},
        isConnected: false,

        // Actions
        setUser: (user) => set({ user, isAuthenticated: true }, false, 'setUser'),
        
        logout: () => set({ 
          user: null, 
          isAuthenticated: false,
          currentGroupID: null,
          messages: {},
          typingUsers: {}
        }, false, 'logout'),

        setGroupChats: (groupChats) => set({ groupChats }, false, 'setGroupChats'),
        
        setCurrentGroup: (groupID) => set({ currentGroupID: groupID }, false, 'setCurrentGroup'),
        
        addMessage: (groupID, message) => set((state) => ({
          messages: {
            ...state.messages,
            [groupID]: [...(state.messages[groupID] || []), message]
          }
        }), false, 'addMessage'),
        
        updateMessage: (groupID, messageID, updates) => set((state) => ({
          messages: {
            ...state.messages,
            [groupID]: state.messages[groupID]?.map(msg => 
              msg.messageID === messageID ? { ...msg, ...updates } : msg
            ) || []
          }
        }), false, 'updateMessage'),
        
        setMessages: (groupID, messages) => set((state) => ({
          messages: {
            ...state.messages,
            [groupID]: messages
          }
        }), false, 'setMessages'),
        
        setLeaderboard: (leaderboard) => set({ leaderboard }, false, 'setLeaderboard'),
        
        setTypingUsers: (groupID, usernames) => set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [groupID]: usernames
          }
        }), false, 'setTypingUsers'),
        
        setConnectionStatus: (isConnected) => set({ isConnected }, false, 'setConnectionStatus'),
        
        addReaction: (groupID, messageID, emoji, userID) => set((state) => ({
          messages: {
            ...state.messages,
            [groupID]: state.messages[groupID]?.map(msg => {
              if (msg.messageID === messageID) {
                const reactions = { ...msg.reactions };
                if (!reactions[emoji]) reactions[emoji] = [];
                if (!reactions[emoji].includes(userID)) {
                  reactions[emoji].push(userID);
                }
                return { ...msg, reactions };
              }
              return msg;
            }) || []
          }
        }), false, 'addReaction'),
        
        removeReaction: (groupID, messageID, emoji, userID) => set((state) => ({
          messages: {
            ...state.messages,
            [groupID]: state.messages[groupID]?.map(msg => {
              if (msg.messageID === messageID) {
                const reactions = { ...msg.reactions };
                if (reactions[emoji]) {
                  reactions[emoji] = reactions[emoji].filter(id => id !== userID);
                  if (reactions[emoji].length === 0) {
                    delete reactions[emoji];
                  }
                }
                return { ...msg, reactions };
              }
              return msg;
            }) || []
          }
        }), false, 'removeReaction'),
      }),
      {
        name: 'chat-storage',
        partialize: (state) => ({ 
          user: state.user, 
          isAuthenticated: state.isAuthenticated 
        }),
      }
    )
  )
);