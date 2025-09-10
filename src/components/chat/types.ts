export interface User {
  id: string;
  fullName: string;
  avatar: string;
  role: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  timestamp: Date;
  type: string;
  readAt?: Date;
}

export interface HomestayInfo {
  id: string;
  name: string;
  description: string;
  guests: number;
  address: string;
  image: string;
  status: string;
  nightAmount: number;
  averageRating?: number;
  totalReviews?: number;
}

export interface Conversation {
  id: string;
  title: string;
  participants: User[];
  lastMessage?: Message;
  homestayInfo: HomestayInfo;
  lastActivity: Date;
  unreadCount?: number;
  createAt?: Date;
}

// Separate interface for chat content when conversation is selected
export interface ConversationMessages {
  conversationId: string;
  messages: Message[];
}