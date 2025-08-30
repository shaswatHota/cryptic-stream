import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Vortex } from '@/components/aceternity/vortex';
import { TextGenerateEffect } from '@/components/aceternity/text-generate-effect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChatStore } from '@/stores/chatStore';
import { chatAPI } from '@/services/api';
import { encryptMessage } from '@/utils/encryption';
import websocketService from '@/services/websocket';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Send, 
  Reply, 
  Smile, 
  MoreVertical,
  Users 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Emoji reactions
const REACTIONS = ['👍', '👎', '😂', '❤️', '😮', '😢', '😡', '🔥'];

const ChatRoom = () => {
  const { groupID } = useParams<{ groupID: string }>();
  const navigate = useNavigate();
  const { 
    user, 
    messages, 
    typingUsers, 
    currentGroupID,
    setCurrentGroup, 
    setMessages,
    addMessage,
    addReaction,
    removeReaction 
  } = useChatStore();
  const { toast } = useToast();

  const [message, setMessage] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const currentMessages = groupID ? messages[groupID] || [] : [];
  const currentTypingUsers = groupID ? typingUsers[groupID] || [] : [];

  useEffect(() => {
    if (!groupID || !user) {
      navigate('/');
      return;
    }

    setCurrentGroup(groupID);
    loadChatData();
    websocketService.joinChat(groupID);

    return () => {
      setCurrentGroup(null);
    };
  }, [groupID, user]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const loadChatData = async () => {
    if (!groupID) return;
    
    setIsLoading(true);
    try {
      const [group, groupMessages] = await Promise.all([
        chatAPI.getGroup(groupID),
        chatAPI.getMessages(groupID)
      ]);
      
      setGroupInfo(group);
      setMessages(groupID, groupMessages);
    } catch (error) {
      console.error('Failed to load chat data:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load chat data. Please try again.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !groupID || !user) return;

    try {
      const encryptedContent = encryptMessage(message.trim(), groupID);
      
      websocketService.sendMessage({
        groupID,
        encryptedContent,
        replyToMessageID: replyToMessage || undefined
      });

      setMessage('');
      setReplyToMessage(null);
      handleStopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    
    if (!isTyping && groupID) {
      setIsTyping(true);
      websocketService.sendTyping({ groupID, isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping && groupID) {
      setIsTyping(false);
      websocketService.sendTyping({ groupID, isTyping: false });
    }
  };

  const handleReaction = (messageID: string, emoji: string) => {
    if (!groupID || !user) return;

    const message = currentMessages.find(m => m.messageID === messageID);
    const userAlreadyReacted = message?.reactions[emoji]?.includes(user.userID);

    if (userAlreadyReacted) {
      websocketService.removeReaction({ groupID, messageID, emoji });
      removeReaction(groupID, messageID, emoji, user.userID);
    } else {
      websocketService.addReaction({ groupID, messageID, emoji });
      addReaction(groupID, messageID, emoji, user.userID);
    }

    setShowEmojiPicker(null);
  };

  const findReplyMessage = (replyToMessageID: string) => {
    return currentMessages.find(m => m.messageID === replyToMessageID);
  };

  const formatTime = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen surface-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <Vortex
      backgroundColor="transparent"
      rangeY={800}
      particleCount={500}
      baseHue={0}
      className="min-h-screen"
      containerClassName="min-h-screen"
    >
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="surface-secondary border-b border-border p-4 flex items-center gap-4 z-10 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-primary hover:surface-tertiary"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary">{groupInfo?.name}</h1>
            <p className="text-sm text-secondary">{groupInfo?.description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-sm text-secondary">{groupInfo?.memberCount}</span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
          {currentMessages.map((msg) => {
            const isOwnMessage = msg.userID === user?.userID;
            const replyMessage = msg.replyToMessageID ? findReplyMessage(msg.replyToMessageID) : null;

            return (
              <div
                key={msg.messageID}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-sm ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                  {/* Reply indicator */}
                  {replyMessage && (
                    <div className="mb-2 p-2 surface-tertiary rounded-lg border-l-4 border-border">
                      <div className="text-xs text-tertiary flex items-center gap-2">
                        <Reply className="w-3 h-3" />
                        Replying to {replyMessage.username}
                      </div>
                      <p className="text-sm text-secondary truncate">
                        {replyMessage.text}
                      </p>
                    </div>
                  )}

                  {/* Message bubble */}
                  <Card 
                    className={`p-4 ${
                      isOwnMessage ? 'chat-bubble-sent' : 'chat-bubble-received'
                    } relative group`}
                  >
                    {/* Message header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{msg.avatar}</span>
                      <span className="font-medium text-sm">{msg.username}</span>
                      <span className="text-xs text-tertiary font-mono">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>

                    {/* Message content */}
                    <p className="text-sm leading-relaxed">{msg.text}</p>

                    {/* Reactions */}
                    {Object.keys(msg.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(msg.reactions).map(([emoji, userIDs]) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg.messageID, emoji)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full surface-tertiary text-xs hover:surface-secondary transition-fast"
                          >
                            <span>{emoji}</span>
                            <span>{userIDs.length}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-fast">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setReplyToMessage(msg.messageID)}
                          className="h-6 w-6 p-0"
                        >
                          <Reply className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowEmojiPicker(
                            showEmojiPicker === msg.messageID ? null : msg.messageID
                          )}
                          className="h-6 w-6 p-0"
                        >
                          <Smile className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Emoji picker */}
                    {showEmojiPicker === msg.messageID && (
                      <div className="absolute top-full mt-2 left-0 surface-primary border border-border rounded-lg p-2 flex gap-1 shadow-large z-20">
                        {REACTIONS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg.messageID, emoji)}
                            className="w-8 h-8 flex items-center justify-center hover:surface-secondary rounded transition-fast"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {currentTypingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="max-w-sm">
                <TextGenerateEffect
                  words={`${currentTypingUsers.join(', ')} ${
                    currentTypingUsers.length === 1 ? 'is' : 'are'
                  } typing...`}
                  className="text-tertiary text-sm"
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="surface-secondary border-t border-border p-4 relative z-10">
          {/* Reply indicator */}
          {replyToMessage && (
            <div className="mb-3 p-2 surface-tertiary rounded-lg border-l-4 border-primary flex items-center justify-between">
              <div>
                <div className="text-xs text-tertiary flex items-center gap-2">
                  <Reply className="w-3 h-3" />
                  Replying to {currentMessages.find(m => m.messageID === replyToMessage)?.username}
                </div>
                <p className="text-sm text-secondary truncate">
                  {currentMessages.find(m => m.messageID === replyToMessage)?.text}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReplyToMessage(null)}
                className="text-tertiary hover:text-primary"
              >
                ×
              </Button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Input
              value={message}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 surface-primary border-border focus:border-primary"
              maxLength={500}
            />
            <Button
              type="submit"
              disabled={!message.trim()}
              className="btn-retro-inverse px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </Vortex>
  );
};

export default ChatRoom;