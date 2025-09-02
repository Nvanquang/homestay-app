import React, { useState, useRef, useEffect } from 'react';
import { Typography, Input, Button, Avatar, Card, Tag, Divider, Image } from 'antd';
import { SendOutlined, MoreOutlined, EnvironmentOutlined, UserOutlined, EyeOutlined, EyeInvisibleOutlined, StarFilled, SearchOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import MessageBubble from './MessageBubble';
import ConversationListPanel from './ConversationListPanel';
import { mockUsers, mockConversations, getConversationMessages } from './mockData';
import { Message, User } from './types';
import '@/styles/ChatInterface.scss';

const { Title, Text } = Typography;

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Find current user based on conversation context - assume user is always the guest in the conversation
  const currentUser = currentConversation?.participants?.find((user: User) => user.role === 'guest') || currentConversation?.participants?.[1] || mockUsers[1];
  const host = mockUsers.find(user => user.role === 'host') || mockUsers[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: uuidv4(),
      content: newMessage.trim(),
      senderId: currentUser.id,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    setIsTyping(true);
    setTimeout(() => {
      const responses = [
        'Cảm ơn bạn đã nhắn tin! Tôi sẽ trả lời ngay.',
        'Được rồi, tôi hiểu rồi. Để tôi kiểm tra và phản hồi bạn nhé.',
        'Tôi sẽ chuẩn bị mọi thứ cho chuyến đi của bạn.',
        'Cảm ơn bạn! Nếu có thêm câu hỏi gì, cứ nhắn tin cho tôi nhé.'
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const hostMessage: Message = {
        id: uuidv4(),
        content: randomResponse,
        senderId: host.id,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, hostMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUserById = (userId: string): User => {
    // First check in current conversation participants
    const participantUser = currentConversation?.participants?.find((user: User) => user.id === userId);
    if (participantUser) return participantUser;
    
    // Fallback to mockUsers
    return mockUsers.find(user => user.id === userId) || mockUsers[0];
  };

  const handleConversationSelect = (conversationId: string) => {
    const conversation = mockConversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
      
      // Load messages separately using the new data structure
      const conversationMessages = getConversationMessages(conversationId);
      setMessages(conversationMessages?.messages || []);
      
      setSelectedConversation(conversationId);
    }
  };

  const renderEmptyState = () => (
    <div className="airbnb-chat__empty-state">
      <div className="airbnb-chat__empty-content">
        <div className="airbnb-chat__empty-icon">
          💬
        </div>
        <Title level={3} style={{ color: '#717171', marginBottom: 8 }}>Chọn một cuộc trò chuyện</Title>
        <Text style={{ color: '#717171' }}>Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin</Text>
      </div>
    </div>
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
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
          <Avatar src={currentUser.avatar} size={32} />
        </div>
      </div>

      <div className="airbnb-chat__body">
        {/* Conversation List */}
        <div className="airbnb-chat__conversations">
          <ConversationListPanel
            conversations={mockConversations}
            activeConversationId={selectedConversation || undefined}
            onConversationSelect={handleConversationSelect}
          />
        </div>

        {/* Main Chat Area */}
        <div className="airbnb-chat__main" style={{marginTop: 10}}>
          {!currentConversation ? (
            renderEmptyState()
          ) : (
            <>
              <div className="airbnb-chat__chat-header">
                <div className="airbnb-chat__chat-info">
                  <Avatar.Group size={36} maxCount={3}>
                    {currentConversation.participants.map((participant: User) => (
                      <Avatar key={participant.id} src={participant.avatar} />
                    ))}
                  </Avatar.Group>
                  <div>
                    <Title level={5} className="airbnb-chat__chat-title">
                      {currentConversation.title}
                    </Title>
                <Text type="secondary" className="airbnb-chat__chat-subtitle">
                  {currentConversation.homestayInfo.name}
                </Text>
              </div>
            </div>
            <Button type="text" icon={<MoreOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />} />
          </div>

          <div className="airbnb-chat__messages">
            {messages.map((message) => {
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
              placeholder="Soạn tin nhắn..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              className="airbnb-chat__input-field"
            />
            <Button
              type="primary"
              icon={<SendOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="airbnb-chat__send-btn"
            />
          </div>
              </>
            )}
        </div>

        {/* Homestay Sidebar */}
        {currentConversation && (
          <div className={`airbnb-chat__sidebar ${!showSidebar ? 'airbnb-chat__sidebar--collapsed' : ''}`}>
            {showSidebar ? (
              <Card className="airbnb-chat__homestay-card" bodyStyle={{ padding: 0 }}>
                <div className="airbnb-chat__property-image">
                  <Button 
                    type="text" 
                    icon={<EyeInvisibleOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
                    onClick={() => setShowSidebar(false)}
                    className="airbnb-chat__sidebar-toggle"
                    title="Ẩn thông tin homestay"
                  />
                  <Image
                    src={currentConversation.homestayInfo.images || '/placeholder-homestay.jpg'}
                    alt={currentConversation.homestayInfo.name}
                    preview={false}
                  />
                  <div className="airbnb-chat__property-rating">
                    <StarFilled style={{ color: '#ff5a5f' }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                    <span>4.8</span>
                  </div>
                </div>
            
            <div className="airbnb-chat__booking-content">
              <Title level={5} className="airbnb-chat__property-title">
                {currentConversation.homestayInfo.name}
              </Title>
              
              <div className="airbnb-chat__property-location">
                <EnvironmentOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                <Text type="secondary">{currentConversation.homestayInfo.address}</Text>
              </div>
              
              <Divider />
              
              <div className="airbnb-chat__homestay-details">
                <Title level={5} className="airbnb-chat__section-title">
                  Thông tin homestay
                </Title>
                
                <div className="airbnb-chat__detail-row">
                  <UserOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                  <div>
                    <Text strong>Sức chứa</Text>
                    <br />
                    <Text>{currentConversation.homestayInfo.guests} khách</Text>
                  </div>
                </div>
                
                <div className="airbnb-chat__description">
                  <Text strong>Mô tả:</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                    {currentConversation.homestayInfo.description}
                  </Text>
                </div>
              </div>
              
              <Divider />
              
              <div className="airbnb-chat__homestay-status">
                <div className="airbnb-chat__status-row">
                  <Text strong>Trạng thái:</Text>
                  <Tag color={currentConversation.homestayInfo.status === 'active' ? 'green' : 'orange'}>
                    {currentConversation.homestayInfo.status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng'}
                  </Tag>
                </div>
                
                <div className="airbnb-chat__price-row">
                  <Text strong style={{ fontSize: '16px' }}>
                    Giá/đêm: {formatPrice(currentConversation.homestayInfo.nightAmount)}
                  </Text>
                </div>
                
                <div className="airbnb-chat__rating-row">
                  <StarFilled style={{ color: '#ff5a5f', marginRight: 4 }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                  <Text strong>{currentConversation.homestayInfo.averageRating?.toFixed(1) || 'N/A'}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>({currentConversation.homestayInfo.totalReviews || 0} đánh giá)</Text>
                </div>
              </div>
              
              <div className="airbnb-chat__actions">
                <Button type="primary" block className="airbnb-chat__primary-btn">
                  Đặt phòng
                </Button>
                <Button block className="airbnb-chat__secondary-btn">
                  Xem chi tiết homestay
                </Button>
              </div>
            </div>
          </Card>
          ) : (
            <Button 
              type="text" 
              icon={<EyeOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
              onClick={() => setShowSidebar(true)}
              className="airbnb-chat__sidebar-show"
              title="Hiện thông tin homestay"
            />
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
