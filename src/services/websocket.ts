import { useChatStore } from '@/stores/chatStore';
import { decryptMessage } from '@/utils/encryption';

type WebSocketEventType = 
  | 'register_user_ws'
  | 'join_chat'
  | 'send_message'
  | 'add_reaction'
  | 'remove_reaction'
  | 'typing'
  | 'new_message'
  | 'message_updated'
  | 'user_typing'
  | 'leaderboard_update'
  | 'new_group_chat';

interface WebSocketMessage {
  type: WebSocketEventType;
  data: any;
}

interface SendMessageData {
  groupID: string;
  encryptedContent: string;
  replyToMessageID?: string;
}

interface ReactionData {
  groupID: string;
  messageID: string;
  emoji: string;
}

interface TypingData {
  groupID: string;
  isTyping: boolean;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = this.onOpen.bind(this);
      this.ws.onmessage = this.onMessage.bind(this);
      this.ws.onclose = this.onClose.bind(this);
      this.ws.onerror = this.onError.bind(this);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private onOpen() {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    useChatStore.getState().setConnectionStatus(true);
    
    // Register user if authenticated
    const { user } = useChatStore.getState();
    if (user) {
      this.registerUser(user.userID);
    }

    // Start heartbeat
    this.startHeartbeat();
  }

  private onMessage(event: MessageEvent) {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.handleMessage(message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private onClose(event: CloseEvent) {
    console.log('WebSocket disconnected:', event.code, event.reason);
    useChatStore.getState().setConnectionStatus(false);
    this.stopHeartbeat();
    
    if (!this.isIntentionallyClosed) {
      this.scheduleReconnect();
    }
  }

  private onError(error: Event) {
    console.error('WebSocket error:', error);
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const store = useChatStore.getState();

    switch (message.type) {
      case 'new_message':
        try {
          const decryptedMessage = {
            ...message.data,
            text: decryptMessage(message.data.encryptedContent, message.data.groupID)
          };
          store.addMessage(message.data.groupID, decryptedMessage);
        } catch (error) {
          console.error('Failed to decrypt message:', error);
        }
        break;

      case 'message_updated':
        store.updateMessage(
          message.data.groupID,
          message.data.messageID,
          message.data.updates
        );
        break;

      case 'user_typing':
        store.setTypingUsers(message.data.groupID, message.data.usernames);
        break;

      case 'leaderboard_update':
        store.setLeaderboard(message.data);
        break;

      case 'new_group_chat':
        const currentChats = store.groupChats;
        store.setGroupChats([...currentChats, message.data]);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  // Public methods
  registerUser(userID: string) {
    this.send('register_user_ws', { userID });
  }

  joinChat(groupID: string) {
    this.send('join_chat', { groupID });
  }

  sendMessage(data: SendMessageData) {
    this.send('send_message', data);
  }

  addReaction(data: ReactionData) {
    this.send('add_reaction', data);
  }

  removeReaction(data: ReactionData) {
    this.send('remove_reaction', data);
  }

  sendTyping(data: TypingData) {
    this.send('typing', data);
  }

  private send(type: WebSocketEventType, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket not connected, cannot send message:', type);
    }
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();
export default websocketService;