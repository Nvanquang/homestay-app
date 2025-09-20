import React, { useState, useEffect } from 'react';
import { Typography, Avatar } from 'antd';
import ConversationListPanel from './conversation.list.panel';
import ChatArea from './chat.area';
import BookingInfo from './booking.info';
import { Conversation, Message, User } from './types';
import '../../styles/chat.interface.scss';
import { callGetConversationsByUser, callGetMessages } from '@/config/api';
import { isSuccessResponse } from '@/config/utils';
import { useAppSelector } from '@/redux/hooks';
import { useChatWebSocket, ChatMessage } from '@/contexts/ChatWebSocketContext';

const { Title } = Typography;

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [conversationsData, setConversationsData] = useState<Conversation[]>([]);
  const [showConversationList, setShowConversationList] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const userStore = useAppSelector(state => state.account.user);
  const userId = userStore.id;
  
  // Use the chat WebSocket context
  const { isConnected, joinConversation, leaveConversation, sendMessage: sendChatMessage, onMessageReceived } = useChatWebSocket();
  
  const currentUser = {
    id: userStore.id,
    fullName: userStore.name,
    avatar: "",
    role: userStore.role.name === "USER" ? "guest" : "host"
  }
  // Initialize conversations and set up message listener
  useEffect(() => {
    init();
    
    // Set up message listener for real-time updates
    onMessageReceived((message: ChatMessage) => {
      // Convert ChatMessage to local Message format
      const localMessage: Message = {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        conversationId: message.conversationId,
        timestamp: message.timestamp,
        type: message.type
      };
      
      // Only add message if it's for the current conversation
      const msgConvId = String(message.conversationId);
      const selConvId = selectedConversation ? String(selectedConversation) : null;

      if (msgConvId === selConvId) {
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(msg => msg.id === message.id);
          if (exists) return prev;
          return [...prev, localMessage];
        });
      } 
    });
  }, [userId, selectedConversation, onMessageReceived]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Auto close conversation list on desktop
      if (window.innerWidth >= 768) {
        setShowConversationList(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const init = async () => {
    const res = await callGetConversationsByUser(userId);
    if (isSuccessResponse(res) && res.data) {
      setConversationsData(res.data);
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageData: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: currentUser.id,
      conversationId: selectedConversation,
      timestamp: new Date(),
      type: 'text'
    };

    try {
      // Send via WebSocket
      await sendChatMessage(messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      // Could show error notification here
    }
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
      // Leave previous conversation
      if (selectedConversation) {
        leaveConversation();
      }
      
      const selectedConv = conversationsData.find(conv => conv.id === conversationId);
      
      if (selectedConv) {
        setCurrentConversation(selectedConv);
        initMessages(conversationId);
        
        // Join the new conversation via WebSocket
        joinConversation(conversationId);
      }
      
      setSelectedConversation(conversationId);
      
      // Close conversation list on mobile after selection
      if (windowWidth < 768) {
        setShowConversationList(false);
      }
    }
  };

  const toggleConversationList = () => {
    setShowConversationList(!showConversationList);
  };

  const initMessages = async (conversationId: string) => {
    const res = await callGetMessages(conversationId);
    if (isSuccessResponse(res) && res.data) {
      // Convert backend messages to local Message format
      const localMessages: Message[] = res.data.map(msg => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        conversationId: conversationId,
        timestamp: msg.timestamp,
        type: msg.type
      }));
      setMessages(localMessages);
    }
  };


  return (
    <div className="airbnb-chat">
      {/* Simple Header with Avatar */}
      <div className="airbnb-chat__simple-header">
        <Avatar src={currentUser?.avatar} size={40} />
      </div>

      <div className="airbnb-chat__body">
        {/* Conversation List */}
        <div className={`airbnb-chat__conversations ${
          windowWidth < 768 && showConversationList ? 'airbnb-chat__conversations--open' : ''
        }`}>
          <ConversationListPanel
            conversations={conversationsData.length > 0 ? conversationsData : []}
            activeConversationId={selectedConversation || undefined}
            onConversationSelect={handleConversationSelect}
          />
        </div>

        {/* Mobile Overlay */}
        {windowWidth < 768 && showConversationList && (
          <div 
            className="airbnb-chat__overlay"
            onClick={() => setShowConversationList(false)}
          />
        )}

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
            showConversationList={showConversationList}
            onToggleConversationList={toggleConversationList}
            windowWidth={windowWidth}
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
