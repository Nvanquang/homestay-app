import React, { useState, useEffect, useRef } from 'react';
import { Typography, Input, Avatar } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import ConversationListPanel from './ConversationListPanel';
import ChatArea from './ChatArea';
import BookingInfo from './BookingInfo';
import { Conversation, Message, User } from './types';
import '../../styles/ChatInterface.scss';
import { callGetConversationsByUser, callGetMessages } from '@/config/api';
import { isSuccessResponse } from '@/config/utils';
import { useAppSelector } from '@/redux/hooks';

const { Title } = Typography;

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [conversationsData, setConversationsData] = useState<Conversation[]>([]);
  const userStore = useAppSelector(state => state.account.user);
  const userId = userStore.id;
  
  // Mock current user for now
  // const currentUse = { id: '1', name: 'User', avatar: '', fullName: 'User', role: 'guest' };
  const currentUser = {
    id: userStore.id,
    fullName: userStore.name,
    avatar: "",
    role: userStore.role.name === "USER" ? "guest" : "host"
  }
  // Use mock data for now
  useEffect(() => {
    init();
  }, [userId]);

  const init = async () => {
    const res = await callGetConversationsByUser(userId);
    if (isSuccessResponse(res) && res.data) {
      setConversationsData(res.data);
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageData = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: currentUser.id,
      conversationId: selectedConversation,
      timestamp: new Date(),
      type: 'text' as const
    };

    // Add message to local state immediately
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUserById = (id: string): User => {
    // First check current user
    if (id === currentUser.id) {
      return {
        id: currentUser.id,
        fullName: currentUser.fullName,
        avatar: currentUser.avatar,
        role: currentUser.role
      };
    }

    // Check conversation participants
    if (currentConversation?.participants) {
      const participant = currentConversation.participants.find((p: any) => p.id === id);
      if (participant) {
        return {
          id: participant.id || id,
          fullName: participant.fullName || participant.name || 'Unknown User',
          avatar: participant.avatar || '',
          role: participant.role || 'guest'
        };
      }
    }

    // Fallback for unknown users
    return {
      id: id,
      fullName: 'Unknown User',
      avatar: '',
      role: 'guest'
    };
  };

  const handleConversationSelect = (conversationId: string) => {
    if (conversationId !== selectedConversation) {
      const selectedConv = conversationsData.find(conv => conv.id === conversationId);
      
      if (selectedConv) {
        setCurrentConversation(selectedConv);
        initMessages(conversationId);
      }
      
      setSelectedConversation(conversationId);
    }
  };

  const initMessages = async (conversationId: string) => {
    const res = await callGetMessages(conversationId);
    if (isSuccessResponse(res) && res.data) {
      setMessages(res.data);
    }
  };


  return (
    <div className="airbnb-chat">
      {/* Header */}
      <div className="airbnb-chat__header">
        <div className="airbnb-chat__header-left">
          <Title level={3} className="airbnb-chat__title">Tin nhắn</Title>
        </div>
        <div className="airbnb-chat__header-right">
          <Input
            placeholder="Tìm kiếm tin nhắn"
            prefix={<SearchOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
            className="airbnb-chat__search"
          />
          <Avatar src={currentUser?.avatar} size={32} />
        </div>
      </div>

      <div className="airbnb-chat__body">
        {/* Conversation List */}
        <div className="airbnb-chat__conversations">
          <ConversationListPanel
            conversations={conversationsData.length > 0 ? conversationsData : []}
            activeConversationId={selectedConversation || undefined}
            onConversationSelect={handleConversationSelect}
          />
        </div>

        {/* Main Chat Area */}
        <div className="airbnb-chat__main">
          <ChatArea
            currentConversation={currentConversation}
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            getUserById={getUserById}
            currentUser={currentUser}
          />
        </div>

        {/* Homestay Booking Info Sidebar */}
        <BookingInfo
          currentConversation={currentConversation}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
