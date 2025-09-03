import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Typography, Input, Button, Avatar } from 'antd';
import { SendOutlined, MoreOutlined } from '@ant-design/icons';
import MessageBubble from './MessageBubble';
import { Message, User } from './types';
import { useAppSelector } from '@/redux/hooks';
import { connectWS, sendMessage, disconnectWS, isConnected } from '@/config/socket';

const { Title, Text } = Typography;

interface ChatAreaProps {
  currentConversation: any;
  messages: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  isTyping: boolean;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  getUserById: (userId: string) => User;
  currentUser: User;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  currentConversation,
  messages,
  newMessage,
  setNewMessage,
  isTyping,
  getUserById,
  currentUser
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = useAppSelector(state => state.account.user.id);
  const conversationId = currentConversation?.id;
  const [loadMessages, setLoadMessages] = useState<Message[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const host = currentConversation?.participants?.find((user: User) => user.role === 'host') 
    || currentConversation?.participants?.[0] 
    || currentUser;

  // Callback để xử lý tin nhắn mới từ WebSocket
  const handleNewMessage = useCallback((msg: Message) => {
    console.log('Received new message:', msg);
    
    // Kiểm tra nếu tin nhắn đã tồn tại (tránh duplicate)
    setLoadMessages((prev) => {
      const exists = prev.some(existingMsg => 
        existingMsg.id === msg.id || 
        (existingMsg.senderId === msg.senderId && 
         existingMsg.content === msg.content && 
         Math.abs(new Date(existingMsg.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 1000)
      );
      
      if (exists) {
        return prev;
      }
      
      return [...prev, msg];
    });
  }, []);

  // Callback để xử lý lỗi WebSocket
  const handleError = useCallback((error: any) => {
    console.error('WebSocket error:', error);
    setConnectionError('Lỗi kết nối WebSocket');
    setWsConnected(false);
  }, []);

  // Effect để quản lý WebSocket connection
  useEffect(() => {
    if (!conversationId) {
      setLoadMessages([]);
      setWsConnected(false);
      setConnectionError(null);
      return;
    }

    console.log('Connecting to WebSocket for conversation:', conversationId);
    
    // Reset state khi chuyển conversation
    setLoadMessages([]);
    setConnectionError(null);

    // Kết nối WebSocket
    const client = connectWS(conversationId, handleNewMessage, handleError);

    // Kiểm tra trạng thái kết nối
    const connectionInterval = setInterval(() => {
      const connected = isConnected();
      setWsConnected(connected);
      
      if (connected && connectionError) {
        setConnectionError(null);
      }
    }, 1000);

    // Cleanup function
    return () => {
      console.log('Cleaning up WebSocket connection');
      clearInterval(connectionInterval);
      disconnectWS();
      setWsConnected(false);
    };
  }, [conversationId, handleNewMessage, handleError]);

  const handleSendMessage = useCallback(() => {
    console.log("Attempting to send message");
    
    if (!newMessage.trim()) {
      console.warn("Empty message, not sending");
      return;
    }

    if (!wsConnected) {
      console.warn("WebSocket not connected");
      setConnectionError('Chưa kết nối được WebSocket');
      return;
    }

    console.log("Sending message:", {
      conversationId,
      userId,
      message: newMessage
    });

    const success = sendMessage(conversationId, userId, newMessage);
    
    if (success) {
      setNewMessage(''); // Clear input after sending
      setConnectionError(null);
    } else {
      setConnectionError('Không thể gửi tin nhắn');
    }
  }, [newMessage, wsConnected, conversationId, userId, setNewMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadMessages, scrollToBottom]);

  // Gộp messages từ props và từ WebSocket, loại bỏ duplicate
  const allMessages = React.useMemo(() => {
    if (!currentConversation) return [];
    
    const messageMap = new Map();
    
    // Thêm messages từ props (with null safety)
    if (Array.isArray(messages)) {
      messages.forEach(msg => {
        if (msg && msg.id) {
          messageMap.set(msg.id, msg);
        }
      });
    }
    
    // Thêm messages từ WebSocket (with null safety)
    if (Array.isArray(loadMessages)) {
      loadMessages.forEach(msg => {
        if (msg && msg.id) {
          messageMap.set(msg.id, msg);
        }
      });
    }
    
    // Convert back to array và sort theo thời gian
    return Array.from(messageMap.values()).sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeA - timeB;
    });
  }, [messages, loadMessages, currentConversation]);

  const renderEmptyState = () => (
    <div className="airbnb-chat__empty-state">
      <div className="airbnb-chat__empty-content">
        <div className="airbnb-chat__empty-icon">
          💬
        </div>
        <Title level={3} style={{ color: '#717171', marginBottom: 8 }}>
          Chọn một cuộc trò chuyện
        </Title>
        <Text style={{ color: '#717171' }}>
          Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
        </Text>
      </div>
    </div>
  );

  if (!currentConversation) {
    return renderEmptyState();
  }

  return (
    <>
      <div className="airbnb-chat__chat-header">
        <div className="airbnb-chat__chat-info">
          <Avatar.Group size={36} maxCount={3}>
            {currentConversation.participants?.map((participant: User) => (
              <Avatar key={participant.id} src={participant.avatar} />
            )) || []}
          </Avatar.Group>
          <div>
            <Title level={5} className="airbnb-chat__chat-title">
              {currentConversation.title}
            </Title>
            <Text type="secondary" className="airbnb-chat__chat-subtitle">
              {currentConversation.homestayInfo.name}
            </Text>
            {/* Hiển thị trạng thái kết nối */}
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              <span style={{ 
                color: wsConnected ? '#52c41a' : '#ff4d4f',
                marginRight: '8px'
              }}>
                ● {wsConnected ? 'Đã kết nối' : 'Chưa kết nối'}
              </span>
              {connectionError && (
                <span style={{ color: '#ff4d4f' }}>
                  {connectionError}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button type="text" icon={<MoreOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />} />
      </div>

      <div className="airbnb-chat__messages">
        {allMessages.map((message) => {
          const sender = getUserById(message.senderId);
          const isCurrentUser = message.senderId === currentUser.id;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              sender={sender}
              isCurrentUser={isCurrentUser}
            />
          );
        })}

        {isTyping && (
          <div className="airbnb-chat__typing">
            <Avatar src={host.avatar} size={32} />
            <div className="airbnb-chat__typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="airbnb-chat__input">
        <Input.TextArea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={wsConnected ? "Soạn tin nhắn..." : "Đang kết nối..."}
          autoSize={{ minRows: 1, maxRows: 3 }}
          className="airbnb-chat__input-field"
          disabled={!wsConnected}
        />
        <Button
          type="primary"
          icon={<SendOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || !wsConnected}
          className="airbnb-chat__send-btn"
          title={!wsConnected ? "Chưa kết nối WebSocket" : "Gửi tin nhắn"}
        />
      </div>
    </>
  );
};

export default ChatArea;