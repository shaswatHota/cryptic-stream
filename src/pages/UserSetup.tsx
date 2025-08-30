import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WavyBackground } from '@/components/aceternity/wavy-background';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useChatStore } from '@/stores/chatStore';
import { userAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Pre-defined avatars
const AVATARS = [
  '🦊', '🐺', '🦝', '🐱', '🐰', '🐼', '🐨', '🦁',
  '🐯', '🐸', '🐙', '🦉', '🦅', '🐧', '🐙', '🦋'
];

const UserSetup = () => {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useChatStore(state => state.setUser);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !selectedAvatar) {
      toast({
        title: "Missing Information",
        description: "Please enter a username and select an avatar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if we're in demo mode
      const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || 
                         !import.meta.env.VITE_API_URL ||
                         import.meta.env.VITE_API_URL.includes('localhost');

      let userData;
      
      if (isDemoMode) {
        // Create demo user
        userData = {
          userID: uuidv4(),
          username: username.trim(),
          avatar: selectedAvatar,
          points: 0
        };
      } else {
        // Create real user via API
        userData = await userAPI.createUser({
          username: username.trim(),
          avatar: selectedAvatar
        });
      }
      
      setUser(userData);
      toast({
        title: "Welcome!",
        description: `Account created successfully. Welcome ${userData.username}!`,
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Setup failed:', error);
      toast({
        title: "Setup Failed",
        description: error.response?.data?.message || "Username might already be taken. Please try another.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WavyBackground
      className="min-h-screen flex items-center justify-center px-4"
      containerClassName="min-h-screen"
      colors={["#000000", "#1a1a1a", "#333333"]}
      waveWidth={30}
      waveOpacity={0.3}
      speed="slow"
    >
      <Card className="w-full max-w-md surface-primary border-border shadow-retro">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            Join Anonymous Chat
          </CardTitle>
          <CardDescription className="text-secondary">
            Choose your identity for the chat experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-primary">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="surface-secondary border-border focus:border-primary"
                maxLength={20}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-primary">
                Choose Avatar
              </label>
              <div className="avatar-grid">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    className="avatar-option flex items-center justify-center text-2xl"
                    data-selected={selectedAvatar === avatar}
                    onClick={() => setSelectedAvatar(avatar)}
                    disabled={isLoading}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-retro-inverse"
              disabled={isLoading || !username.trim() || !selectedAvatar}
            >
              {isLoading ? 'Creating Account...' : 'Enter Chat'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </WavyBackground>
  );
};

export default UserSetup;