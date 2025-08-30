import { useEffect, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { SAMPLE_GROUPS, SAMPLE_LEADERBOARD, SAMPLE_MESSAGES } from '@/utils/constants';

export const useDemo = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { setGroupChats, setLeaderboard, setMessages, user } = useChatStore();

  useEffect(() => {
    // Check if we should use demo mode (backend not available)
    const isDemo = import.meta.env.VITE_DEMO_MODE === 'true' || 
                   !import.meta.env.VITE_API_URL ||
                   import.meta.env.VITE_API_URL.includes('localhost');
    
    setIsDemoMode(isDemo);

    if (isDemo && user) {
      // Load sample data in demo mode
      setGroupChats(SAMPLE_GROUPS);
      setLeaderboard(SAMPLE_LEADERBOARD);
      
      // Load sample messages for each group
      Object.entries(SAMPLE_MESSAGES).forEach(([groupID, messages]) => {
        setMessages(groupID, messages);
      });
    }
  }, [user, setGroupChats, setLeaderboard, setMessages]);

  return { isDemoMode };
};