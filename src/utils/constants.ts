// Sample group chats for demo purposes
export const SAMPLE_GROUPS = [
  {
    groupID: 'gossip-central',
    name: '🗣️ Gossip Central',
    description: 'Share the latest campus gossip and rumors anonymously',
    memberCount: 247,
    lastMessage: 'Did you hear about what happened in the library yesterday?',
    lastMessageTime: Date.now() - 1000 * 60 * 30 // 30 minutes ago
  },
  {
    groupID: 'confessions',
    name: '💭 Confessions',
    description: 'Share your deepest secrets and confessions safely',
    memberCount: 189,
    lastMessage: 'I actually enjoy the smell of permanent markers...',
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 2 // 2 hours ago
  },
  {
    groupID: 'cgpa-flex',
    name: '📊 CGPA Flex',
    description: 'Humble bragging about grades (anonymously of course)',
    memberCount: 156,
    lastMessage: 'Just got my results back and... 4.0 again 😎',
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 4 // 4 hours ago
  },
  {
    groupID: 'jokes-memes',
    name: '😂 Jokes & Memes',
    description: 'Daily dose of humor and fresh memes',
    memberCount: 312,
    lastMessage: 'Why did the developer go broke? Because he used up all his cache!',
    lastMessageTime: Date.now() - 1000 * 60 * 45 // 45 minutes ago
  },
  {
    groupID: 'guess-who',
    name: '🕵️ Guess Who Game',
    description: 'Drop hints about yourself and let others guess who you are',
    memberCount: 98,
    lastMessage: 'I wear the same hoodie 3 days in a row, always sit in the back row...',
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 1 // 1 hour ago
  },
  {
    groupID: 'late-night-thoughts',
    name: '🌙 Late Night Thoughts',
    description: 'For those 3 AM philosophical discussions',
    memberCount: 203,
    lastMessage: 'Is cereal soup? Discuss.',
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 6 // 6 hours ago
  }
];

// Sample users for leaderboard
export const SAMPLE_LEADERBOARD = [
  { userID: '1', username: 'NightOwl', avatar: '🦉', points: 2847 },
  { userID: '2', username: 'CoffeeLover', avatar: '☕', points: 2156 },
  { userID: '3', username: 'BookWorm', avatar: '📚', points: 1923 },
  { userID: '4', username: 'MemeKing', avatar: '👑', points: 1876 },
  { userID: '5', username: 'StudyBuddy', avatar: '🤓', points: 1654 },
  { userID: '6', username: 'MidnightSnack', avatar: '🍕', points: 1432 },
  { userID: '7', username: 'GymRat', avatar: '💪', points: 1289 },
  { userID: '8', username: 'ArtisticSoul', avatar: '🎨', points: 1156 }
];

// Sample messages for demo
export const SAMPLE_MESSAGES = {
  'gossip-central': [
    {
      messageID: '1',
      userID: '1',
      username: 'NightOwl',
      avatar: '🦉',
      text: 'Did anyone else see the drama at the cafeteria today?',
      timestamp: Date.now() - 1000 * 60 * 60 * 2,
      reactions: { '👀': ['2', '3'], '😮': ['4'] }
    },
    {
      messageID: '2',
      userID: '2',
      username: 'CoffeeLover',
      avatar: '☕',
      text: 'SPILL THE TEA! What happened?',
      timestamp: Date.now() - 1000 * 60 * 60 * 2 + 30000,
      reactions: { '☕': ['1', '3', '4'] },
      replyToMessageID: '1'
    }
  ]
};