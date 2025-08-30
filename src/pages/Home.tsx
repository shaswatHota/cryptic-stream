import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BentoGrid, BentoGridItem } from '@/components/aceternity/bento-grid';
import { HoverEffect } from '@/components/aceternity/card-hover-effect';
import { WavyBackground } from '@/components/aceternity/wavy-background';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChatStore } from '@/stores/chatStore';
import { chatAPI, userAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useDemo } from '@/hooks/useDemo';
import { MessageSquare, Users, Trophy, Crown, Medal, Award } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user, groupChats, leaderboard, setGroupChats, setLeaderboard } = useChatStore();
  const { toast } = useToast();
  const { isDemoMode } = useDemo();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (isDemoMode) {
      // Demo mode - data is loaded by useDemo hook
      return;
    }
    
    try {
      const [chats, leaderboardData] = await Promise.all([
        chatAPI.getGroups(),
        userAPI.getLeaderboard()
      ]);
      setGroupChats(chats);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Connection Error",
        description: "Using demo mode. Connect to backend for full functionality.",
        variant: "destructive",
      });
    }
  };


  const handleJoinChat = (groupID: string) => {
    navigate(`/chat/${groupID}`);
  };

  const getLeaderboardIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <Trophy className="w-4 h-4 text-tertiary" />;
    }
  };

  const formatLastMessage = (message?: string, time?: number) => {
    if (!message || !time) return 'No messages yet';
    const date = new Date(time);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return `"${message.slice(0, 30)}..." - just now`;
    if (diffHours < 24) return `"${message.slice(0, 30)}..." - ${diffHours}h ago`;
    return `"${message.slice(0, 30)}..." - ${Math.floor(diffHours / 24)}d ago`;
  };

  const chatItems = groupChats.map(chat => ({
    title: chat.name,
    description: chat.description,
    icon: <MessageSquare className="w-6 h-6 text-primary" />,
    onClick: () => handleJoinChat(chat.groupID)
  }));

  return (
    <div className="min-h-screen relative">
      <WavyBackground className="absolute inset-0" />
      <div className="relative z-10 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">
            Anonymous Chat Hub
            {isDemoMode && <Badge className="ml-3 text-xs">DEMO MODE</Badge>}
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            Enter the void. Share your darkest thoughts, deepest secrets, and wildest confessions. 
            No names, no judgment, no consequences. Only truth in the shadows.
          </p>
          {user && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="text-2xl">{user.avatar}</span>
              <span className="font-semibold text-primary">{user.username}</span>
              <Badge variant="secondary" className="font-mono">
                {user.points} pts
              </Badge>
            </div>
          )}
        </div>


        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Group Chats - Left Side */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-primary mb-6">Active Conversations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupChats.map((chat) => (
                <Card 
                  key={chat.groupID}
                  className="cursor-pointer surface-primary border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-fast"
                  onClick={() => handleJoinChat(chat.groupID)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-primary">{chat.name}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-secondary" />
                        <span className="text-sm text-secondary">{chat.memberCount}</span>
                      </div>
                    </div>
                    <p className="text-sm text-secondary mb-3">{chat.description}</p>
                    <div className="text-xs text-tertiary">
                      {formatLastMessage(chat.lastMessage, chat.lastMessageTime)}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Empty State */}
              {groupChats.length === 0 && (
                <Card className="md:col-span-2 surface-primary border-border">
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-muted mx-auto mb-4" />
                    <h3 className="font-bold text-primary mb-2">No Groups Yet</h3>
                    <p className="text-secondary">The void awaits your first conversation...</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Leaderboard - Right Side */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-primary mb-6">Shadow Rankings</h2>
            <Card className="surface-primary border-border shadow-retro">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((leader, index) => (
                    <div 
                      key={leader.userID} 
                      className="flex items-center gap-3 p-3 surface-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-2 min-w-[60px]">
                        {getLeaderboardIcon(index + 1)}
                        <span className="font-mono text-sm">#{index + 1}</span>
                      </div>
                      <span className="text-xl">{leader.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-primary truncate">{leader.username}</div>
                        <div className="text-sm text-secondary">{leader.points} pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Home;