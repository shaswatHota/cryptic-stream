import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BentoGrid, BentoGridItem } from '@/components/aceternity/bento-grid';
import { HoverEffect } from '@/components/aceternity/card-hover-effect';
import { Button as MovingBorderButton } from '@/components/aceternity/moving-border';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (isDemoMode) {
      toast({
        title: "Demo Mode",
        description: "Group creation is disabled in demo mode. Connect to backend for full functionality.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const newGroup = await chatAPI.createGroup({
        name: newGroupName.trim(),
        description: newGroupDescription.trim()
      });
      
      setGroupChats([...groupChats, newGroup]);
      setIsCreateDialogOpen(false);
      setNewGroupName('');
      setNewGroupDescription('');
      
      toast({
        title: "Group Created",
        description: `${newGroup.name} has been created successfully!`,
      });
    } catch (error: any) {
      console.error('Failed to create group:', error);
      toast({
        title: "Creation Failed",
        description: error.response?.data?.message || "Failed to create group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
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
    <div className="min-h-screen surface-primary px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">
            Anonymous Chat Hub
            {isDemoMode && <Badge className="ml-3 text-xs">DEMO MODE</Badge>}
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            Connect with others in secure, anonymous group conversations. 
            Share thoughts, confessions, jokes, and more in a safe space.
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

        {/* Create New Group Button */}
        <div className="flex justify-center mb-12">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <MovingBorderButton
                borderRadius="1rem"
                className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800"
              >
                Create New Group
              </MovingBorderButton>
            </DialogTrigger>
            <DialogContent className="surface-primary border-border">
              <DialogHeader>
                <DialogTitle className="text-primary">Create New Group Chat</DialogTitle>
                <DialogDescription className="text-secondary">
                  Start a new conversation topic for the community
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">Group Name</label>
                  <Input
                    placeholder="e.g., Late Night Confessions"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    maxLength={50}
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">Description</label>
                  <Textarea
                    placeholder="What's this group about?"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    maxLength={200}
                    disabled={isCreating}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={isCreating} className="btn-retro-inverse flex-1">
                    {isCreating ? 'Creating...' : 'Create Group'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isCreating}
                    className="btn-retro"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content Grid */}
        <BentoGrid className="max-w-7xl mx-auto">
          {/* Leaderboard - Large Item */}
          <BentoGridItem
            className="md:col-span-1 md:row-span-2"
            title="🏆 Leaderboard"
            description="Top contributors in the community"
            header={
              <div className="space-y-3 mb-4">
                {leaderboard.slice(0, 5).map((leader, index) => (
                  <div 
                    key={leader.userID} 
                    className="flex items-center gap-3 p-3 surface-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {getLeaderboardIcon(index + 1)}
                      <span className="font-mono text-sm">#{index + 1}</span>
                    </div>
                    <span className="text-xl">{leader.avatar}</span>
                    <div className="flex-1">
                      <div className="font-medium text-primary">{leader.username}</div>
                      <div className="text-sm text-secondary">{leader.points} points</div>
                    </div>
                  </div>
                ))}
              </div>
            }
          />

          {/* Group Chats Grid */}
          {groupChats.map((chat) => (
            <BentoGridItem
              key={chat.groupID}
              className="cursor-pointer"
              title={chat.name}
              description={chat.description}
              onClick={() => handleJoinChat(chat.groupID)}
              header={
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <Users className="w-4 h-4 text-secondary" />
                      <span className="text-sm text-secondary">{chat.memberCount}</span>
                    </div>
                  </div>
                  <div className="text-xs text-tertiary">
                    {formatLastMessage(chat.lastMessage, chat.lastMessageTime)}
                  </div>
                </div>
              }
            />
          ))}

          {/* Empty State */}
          {groupChats.length === 0 && (
            <BentoGridItem
              className="md:col-span-2"
              title="No Groups Yet"
              description="Be the first to create a group chat!"
              header={
                <div className="flex items-center justify-center h-24 mb-4">
                  <MessageSquare className="w-12 h-12 text-muted" />
                </div>
              }
            />
          )}
        </BentoGrid>
      </div>
    </div>
  );
};

export default Home;