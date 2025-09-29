import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Typography, Input, Button, Avatar, Modal, Space, Badge } from 'antd';
import { SendOutlined, MenuOutlined, CloseOutlined, PhoneOutlined, VideoCameraOutlined } from '@ant-design/icons';
import MessageBubble from './message.bubble';
import { Message, User } from './types';
import { useAppSelector } from '@/redux/hooks';
import { useChatWebSocket, ChatMessage } from '@/contexts/ChatWebSocketContext';
import { useWebRTC } from '@/config/useWebRTC';

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
  showConversationList?: boolean;
  onToggleConversationList?: () => void;
  windowWidth?: number;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  currentConversation,
  messages,
  newMessage,
  setNewMessage,
  isTyping,
  getUserById,
  currentUser,
  showConversationList,
  onToggleConversationList,
  windowWidth
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoggedRef = useRef<boolean>(false);
  const userId = useAppSelector(state => state.account.user.id);
  const conversationId = currentConversation?.id;
  const [loadMessages, setLoadMessages] = useState<Message[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callTypeVideo, setCallTypeVideo] = useState(true);
  
  const { 
    isConnected: wsConnected, 
    connectionState, 
    joinConversation, 
    leaveConversation, 
    sendMessage: sendChatMessage, 
    onMessageReceived 
  } = useChatWebSocket();
  
  const host = currentConversation?.participants?.find((user: User) => user.role === 'host') 
    || currentConversation?.participants?.[0] 
    || currentUser;

  // Determine remote user for 1-1 (fallback to first non-current user)
  const remoteUserId = React.useMemo(() => {
    const list: User[] = currentConversation?.participants || [];
    const selfId = currentUser?.id?.toString?.() ?? currentUser?.id;
    const other = list.find(u => (u?.id?.toString?.() ?? u.id) !== selfId);
    const id = other?.id ? other.id.toString() : undefined;
    try { console.log('[CHAT] conversationId=', currentConversation?.id, 'remoteUserId=', id); } catch {}
    return id as string | undefined;
  }, [currentConversation, currentUser.id]);

  // WebRTC hook
  const {
    callState,
    isVideo,
    isCaller,
    hasConnected,
    localStream,
    remoteStream,
    muted,
    cameraOff,
    incomingCall,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    getLastCallDurationSeconds,
  } = useWebRTC({ conversationId: conversationId?.toString(), localUserId: userId, remoteUserId });

  // Callback để xử lý tin nhắn mới từ WebSocket
  const handleNewMessage = useCallback((msg: ChatMessage) => {    
    // Convert ChatMessage to Message format
    const message: Message = {
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      conversationId: msg.conversationId,
      timestamp: msg.timestamp,
      type: msg.type
    };
    
    // Kiểm tra nếu tin nhắn đã tồn tại (tránh duplicate)
    setLoadMessages((prev) => {
      const exists = prev.some(existingMsg => 
        existingMsg.id === message.id || 
        (existingMsg.senderId === message.senderId && 
         existingMsg.content === message.content && 
         Math.abs(new Date(existingMsg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 1000)
      );
      
      if (exists) {
        return prev;
      }

      return [...prev, message];
    });
  }, []);

  // Set up message listener
  useEffect(() => {
    onMessageReceived(handleNewMessage);
  }, [onMessageReceived, handleNewMessage]);

  // Effect để quản lý conversation joining/leaving
  useEffect(() => {
    if (!conversationId) {
      setLoadMessages([]);
      setConnectionError(null);
      leaveConversation();
      return;
    }

    
    // Reset state khi chuyển conversation
    setLoadMessages([]);
    setConnectionError(null);

    // Join conversation
    joinConversation(conversationId.toString());

    // Cleanup function
    return () => {
      leaveConversation();
    };
  }, [conversationId, joinConversation, leaveConversation]);

  // Update connection error based on connection state
  useEffect(() => {
    if (connectionState === 'ERROR') {
      setConnectionError('Lỗi kết nối WebSocket');
    } else if (connectionState === 'CONNECTED') {
      setConnectionError(null);
    }
  }, [connectionState]);

  // Auto handle when call ends (local or remote): when state -> IDLE, close panel and log once for caller
  useEffect(() => {
    const handleEnd = async () => {
      if (callState === 'IDLE' && callModalOpen) {
        if (isCaller && !hasLoggedRef.current) {
          try { await logCallMessage(); } catch {}
          hasLoggedRef.current = true;
        }
        setCallModalOpen(false);
      }
    };
    handleEnd();
  }, [callState, callModalOpen, isCaller]);

  const handleSendMessage = useCallback(async () => {
    
    if (!newMessage.trim()) {
      return;
    }

    try {
      const chatMessage: ChatMessage = {
        id: Date.now().toString(),
        content: newMessage,
        senderId: userId,
        conversationId: conversationId.toString(),
        timestamp: new Date(),
        type: 'text'
      };
      
      await sendChatMessage(chatMessage);
      setNewMessage(''); // Clear input after sending
      setConnectionError(null);
    } catch (error) {
      setConnectionError('Không thể gửi tin nhắn');
    }
  }, [newMessage, wsConnected, conversationId, userId, setNewMessage, sendChatMessage]);

  const handleStartCall = useCallback(async (video: boolean) => {
    if (!conversationId) return;
    setCallTypeVideo(video);
    setCallModalOpen(true);
    hasLoggedRef.current = false;
    await startCall(video);
  }, [conversationId, startCall]);

  const handleAcceptIncoming = useCallback(async () => {
    setCallTypeVideo(incomingCall?.isVideo ?? true);
    setCallModalOpen(true);
    hasLoggedRef.current = false;
    await acceptCall();
  }, [incomingCall, acceptCall]);

  const handleRejectIncoming = useCallback(async () => {
    await rejectCall();
    // Receiver shouldn't log call summary
  }, [rejectCall]);

  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h} giờ ${m} phút ${s} giây`;
    if (m > 0) return `${m} phút ${s} giây`;
    return `${s} giây`;
  };

  async function logCallMessage() {
    if (!conversationId) return;
    // Only caller logs summary; guard via hook flag
    if (!isCaller) return;
    let secs = getLastCallDurationSeconds();
    if ((!secs || secs <= 0) && hasConnected) {
      // Nếu đã từng CONNECTED nhưng duration chưa kịp cập nhật, để tối thiểu 1 giây
      secs = 1;
    }
    const content = hasConnected && secs && secs > 0
      ? `${isVideo ? 'Cuộc gọi video' : 'Cuộc gọi thoại'} đã kết thúc • Thời lượng: ${formatDuration(secs)}`
      : `${isVideo ? 'Cuộc gọi video' : 'Cuộc gọi thoại'} chưa kết nối hoặc bị bỏ lỡ`;
    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      senderId: userId,
      conversationId: conversationId.toString(),
      timestamp: new Date(),
      type: 'text'
    };
    try { await sendChatMessage(chatMessage); } catch {}
  }

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
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
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
      <div className="airbnb-chat__chat-header" style={{marginTop: 20}}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Incoming call inline indicator */}
          {incomingCall && (
            <Badge color="green" text={incomingCall.isVideo ? 'Cuộc gọi video đến' : 'Cuộc gọi thoại đến'} />
          )}
          {/* Hamburger Menu Button - Only show on mobile */}
          {windowWidth && windowWidth < 768 && onToggleConversationList && (
            <Button
              type="text"
              icon={showConversationList ? 
                <CloseOutlined /> : 
                <MenuOutlined />
              }
              onClick={onToggleConversationList}
              className="airbnb-chat__hamburger-btn"
            />
          )}
          {/* Call buttons */}
          <Button
            type="text"
            icon={<PhoneOutlined />}
            title="Gọi thoại"
            onClick={() => handleStartCall(false)}
            disabled={!wsConnected}
          />
          <Button
            type="text"
            icon={<VideoCameraOutlined />}
            title="Gọi video"
            onClick={() => handleStartCall(true)}
            disabled={!wsConnected}
          />
          
        </div>
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
          disabled={false}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="airbnb-chat__send-btn"
          title={!wsConnected ? "Chưa kết nối WebSocket" : "Gửi tin nhắn"}
        />
      </div>

      {/* Incoming call modal */}
      <Modal
        open={!!incomingCall && !callModalOpen}
        title={incomingCall?.isVideo ? 'Cuộc gọi video đến' : 'Cuộc gọi thoại đến'}
        onCancel={handleRejectIncoming}
        footer={
          <Space>
            <Button onClick={handleRejectIncoming}>Từ chối</Button>
            <Button type="primary" onClick={handleAcceptIncoming}>Chấp nhận</Button>
          </Space>
        }
      >
        {host && (
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <Avatar src={host.avatar} size={40} />
            <div>
              <div style={{fontWeight:600}}>{host.fullName}</div>
              <div style={{color:'#888'}}>đang gọi cho bạn...</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Call panel modal */}
      <Modal
        open={callModalOpen}
        width={1100}
        bodyStyle={{ padding: 16 }}
        style={{ top: 40 }}
        title={callTypeVideo ? 'Đang gọi video' : 'Đang gọi thoại'}
        onCancel={async () => { await endCall(); setCallModalOpen(false); }}
        footer={
          <Space>
            <Button onClick={toggleMute}>{muted ? 'Bật mic' : 'Tắt mic'}</Button>
            {callTypeVideo && <Button onClick={toggleCamera}>{cameraOff ? 'Bật camera' : 'Tắt camera'}</Button>}
            <Button danger onClick={async () => { await endCall(); setCallModalOpen(false); }}>Kết thúc</Button>
          </Space>
        }
      >
        <div style={{display:'grid', gridTemplateColumns: callTypeVideo ? '1fr 1fr' : '1fr', gap:12, alignItems:'stretch'}}>
          {/* Local preview */}
          <video
            style={{width:'100%', height: callTypeVideo ? 520 : 220, objectFit:'cover', background:'#000', borderRadius:8}}
            playsInline
            muted
            autoPlay
            ref={(el) => {
              if (el && localStream) {
                if (el.srcObject !== localStream) el.srcObject = localStream;
                // local preview stays muted
                try { el.play && el.play(); } catch {}
              }
            }}
          />
          {/* Remote view (only show when stream exists) */}
          {callTypeVideo && (
            <video
              style={{width:'100%', height: 520, objectFit:'cover', background:'#000', borderRadius:8}}
              playsInline
              autoPlay
              ref={(el) => {
                if (el && remoteStream) {
                  if (el.srcObject !== remoteStream) el.srcObject = remoteStream;
                  el.muted = false;
                  el.volume = 1.0;
                  try { el.play && el.play(); } catch {}
                }
              }}
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default ChatArea;