import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Shield, Users, Zap } from 'lucide-react';

interface WelcomeProps {
  onGetStarted: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen surface-primary flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-primary mb-6">
            Anonymous Chat
          </h1>
          <p className="text-2xl text-secondary mb-8 max-w-2xl mx-auto">
            Join secure, anonymous conversations. Share thoughts, confessions, jokes, and more in a safe space.
          </p>
          <Badge variant="secondary" className="text-sm font-mono">
            End-to-End Encrypted • Real-time • Anonymous
          </Badge>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="surface-secondary border-border p-6">
            <Shield className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-primary mb-2">Secure</h3>
            <p className="text-sm text-secondary">End-to-end encrypted messages</p>
          </Card>
          
          <Card className="surface-secondary border-border p-6">
            <Users className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-primary mb-2">Anonymous</h3>
            <p className="text-sm text-secondary">No personal info required</p>
          </Card>
          
          <Card className="surface-secondary border-border p-6">
            <Zap className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-primary mb-2">Real-time</h3>
            <p className="text-sm text-secondary">Instant message delivery</p>
          </Card>
          
          <Card className="surface-secondary border-border p-6">
            <MessageSquare className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-primary mb-2">Groups</h3>
            <p className="text-sm text-secondary">Join topic-based chats</p>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-primary">
            Popular Chat Groups
          </h2>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="surface-secondary p-4 rounded-lg border border-border">
              <h4 className="font-medium text-primary">🗣️ Gossip Central</h4>
              <p className="text-sm text-secondary">Share campus gossip anonymously</p>
            </div>
            <div className="surface-secondary p-4 rounded-lg border border-border">
              <h4 className="font-medium text-primary">💭 Confessions</h4>
              <p className="text-sm text-secondary">Your deepest secrets, safely shared</p>
            </div>
            <div className="surface-secondary p-4 rounded-lg border border-border">
              <h4 className="font-medium text-primary">😂 Jokes & Memes</h4>
              <p className="text-sm text-secondary">Daily dose of humor</p>
            </div>
          </div>

          <Button 
            onClick={onGetStarted}
            size="lg"
            className="btn-retro-inverse text-lg px-12 py-6"
          >
            Get Started →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;