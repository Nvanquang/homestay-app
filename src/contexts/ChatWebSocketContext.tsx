import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Client } from '@stomp/stompjs';
import { useAppSelector } from '@/redux/hooks';

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  timestamp: Date;
  type: 'text';
}

interface ChatWebSocketContextType {
  isConnected: boolean;
  connectionState: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  joinConversation: (conversationId: string) => void;
  leaveConversation: () => void;
  sendMessage: (message: ChatMessage) => Promise<void>;
  onMessageReceived: (callback: (message: ChatMessage) => void) => void;
  disconnect: () => void;
}

const ChatWebSocketContext = createContext<ChatWebSocketContextType | null>(null);

interface ChatWebSocketProviderProps {
  children: ReactNode;
}

export const ChatWebSocketProvider: React.FC<ChatWebSocketProviderProps> = ({ children }) => {
  const user = useAppSelector(state => state.account.user);
  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'>('DISCONNECTED');
  const client = useRef<Client | null>(null);
  const subscription = useRef<any>(null);
  const currentConversationId = useRef<string | null>(null);
  const messageCallback = useRef<((message: ChatMessage) => void) | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  // Exponential backoff calculation
  const getReconnectDelay = (attempt: number): number => {
    return Math.min(baseReconnectDelay * Math.pow(2, attempt), 30000);
  };

  const connect = () => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    // If already connected, don't reconnect
    if (client.current?.connected) {
      return;
    }

    setConnectionState('CONNECTING');
    
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:8080';
    
    const newClient = new Client({
      brokerURL: `${socketUrl}/chat`,
      reconnectDelay: 0, // We handle reconnection manually
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectionTimeout: 3000,

      onConnect: () => {
        console.log('Chat WebSocket connected successfully');
        setIsConnected(true);
        setConnectionState('CONNECTED');
        reconnectAttempts.current = 0;

        // If there was a conversation we were subscribed to, rejoin it
        if (currentConversationId.current) {
          joinConversation(currentConversationId.current);
        }
      },

      onWebSocketError: (error) => {
        console.error('Chat WebSocket error:', error);
        setConnectionState('ERROR');
        scheduleReconnect();
      },

      onStompError: (frame) => {
        console.error('Chat STOMP error:', frame);
        setConnectionState('ERROR');
        scheduleReconnect();
      },

      onDisconnect: (frame) => {
        console.log('Chat WebSocket disconnected:', frame);
        setIsConnected(false);
        setConnectionState('DISCONNECTED');
        scheduleReconnect();
      }
    });

    client.current = newClient;
    newClient.activate();
  };

  const scheduleReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('Max chat WebSocket reconnection attempts reached');
      setConnectionState('ERROR');
      return;
    }

    const delay = getReconnectDelay(reconnectAttempts.current);
    console.log(`Scheduling chat WebSocket reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
    
    setTimeout(() => {
      reconnectAttempts.current++;
      connect();
    }, delay);
  };

  const disconnect = () => {
    leaveConversation();
    if (client.current) {
      console.log('Disconnecting chat WebSocket...');
      client.current.deactivate();
      client.current = null;
      setIsConnected(false);
      setConnectionState('DISCONNECTED');
    }
  };

  const joinConversation = (conversationId: string) => {
    if (!client.current?.connected) {
      console.warn('Chat WebSocket not connected, cannot join conversation');
      // Store the conversation ID to rejoin when connected
      currentConversationId.current = conversationId;
      return;
    }

    // Leave previous conversation if exists
    if (subscription.current) {
      subscription.current.unsubscribe();
    }

    console.log(`Joining conversation ${conversationId}`);
    currentConversationId.current = conversationId;
    
    subscription.current = client.current.subscribe(`/topic/conversations/${conversationId}`, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        console.log('Received chat message:', parsedMessage);
        
        // Convert to our ChatMessage format
        const chatMessage: ChatMessage = {
          id: parsedMessage.id || Date.now().toString(),
          content: parsedMessage.content || parsedMessage.message,
          senderId: parsedMessage.senderId,
          conversationId: parsedMessage.conversationId?.toString() || conversationId,
          timestamp: new Date(parsedMessage.timestamp || Date.now()),
          type: 'text'
        };
        
        if (messageCallback.current) {
          messageCallback.current(chatMessage);
        }
      } catch (error) {
        console.error('Error parsing chat message:', error);
      }
    });
  };

  const leaveConversation = () => {
    if (subscription.current) {
      console.log('Leaving conversation');
      subscription.current.unsubscribe();
      subscription.current = null;
    }
    currentConversationId.current = null;
  };

  const sendMessage = async (message: ChatMessage): Promise<void> => {
    // If not connected, try to connect first
    if (!client.current?.connected) {
      console.log('WebSocket not connected, attempting to connect...');
      connect();
      
      // Wait for connection with timeout
      const maxWaitTime = 5000; // 5 seconds
      const startTime = Date.now();
      
      while (!client.current?.connected && (Date.now() - startTime) < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!client.current?.connected) {
        throw new Error('WebSocket connection timeout');
      }
    }

    try {
      client.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          conversationId: parseInt(message.conversationId),
          senderId: message.senderId,
          content: message.content,
          type: 'TEXT'
        })
      });

      console.log('Message sent successfully via WebSocket');
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const onMessageReceived = (callback: (message: ChatMessage) => void) => {
    messageCallback.current = callback;
  };

  // Connect when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user?.id]);

  const contextValue: ChatWebSocketContextType = {
    isConnected,
    connectionState,
    joinConversation,
    leaveConversation,
    sendMessage,
    onMessageReceived,
    disconnect
  };

  return (
    <ChatWebSocketContext.Provider value={contextValue}>
      {children}
    </ChatWebSocketContext.Provider>
  );
};

export const useChatWebSocket = (): ChatWebSocketContextType => {
  const context = useContext(ChatWebSocketContext);
  if (!context) {
    throw new Error('useChatWebSocket must be used within a ChatWebSocketProvider');
  }
  return context;
};