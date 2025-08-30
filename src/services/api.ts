import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('chat-storage');
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      if (userData.state?.user?.userID) {
        config.headers['X-User-ID'] = userData.state.user.userID;
      }
    } catch (error) {
      console.warn('Failed to parse user data from localStorage:', error);
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface CreateUserRequest {
  username: string;
  avatar: string;
}

export interface CreateUserResponse {
  userID: string;
  username: string;
  avatar: string;
  points: number;
}

export interface GroupChat {
  groupID: string;
  name: string;
  description: string;
  memberCount: number;
  lastMessage?: string;
  lastMessageTime?: number;
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
  reactions: Record<string, string[]>;
}

export interface User {
  userID: string;
  username: string;
  avatar: string;
  points: number;
}

export interface CreateGroupRequest {
  name: string;
  description: string;
}

// User API
export const userAPI = {
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await api.post('/api/users/setup', data);
    return response.data;
  },

  async getUser(userID: string): Promise<User> {
    const response = await api.get(`/api/users/${userID}`);
    return response.data;
  },

  async getLeaderboard(): Promise<User[]> {
    const response = await api.get('/api/users/leaderboard');
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  async createGroup(data: CreateGroupRequest): Promise<GroupChat> {
    const response = await api.post('/api/chats/', data);
    return response.data;
  },

  async getGroups(): Promise<GroupChat[]> {
    const response = await api.get('/api/chats/');
    return response.data;
  },

  async getGroup(groupID: string): Promise<GroupChat> {
    const response = await api.get(`/api/chats/${groupID}`);
    return response.data;
  },

  async getMessages(groupID: string): Promise<Message[]> {
    const response = await api.get(`/api/chats/${groupID}/messages`);
    return response.data;
  },
};

export default api;