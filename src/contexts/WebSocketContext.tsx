import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Client } from '@stomp/stompjs';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { notification } from 'antd';
import { addPaymentNotification } from '@/redux/slice/notificationSlice';

// Notification types
export interface PaymentNotification {
  bookingId: number;
  status: 'success' | 'failed';
  message: string;
  timestamp: string;
}

export type AppNotification = PaymentNotification;

interface WebSocketContextType {
  isConnected: boolean;
  connectionState: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  subscribeToPayment: (bookingId: number) => void;
  unsubscribeFromPayment: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.account.user);
  const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'>('DISCONNECTED');
  const client = useRef<Client | null>(null);
  const subscription = useRef<any>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  // Exponential backoff calculation
  const getReconnectDelay = (attempt: number): number => {
    return Math.min(baseReconnectDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
  };

  // Handle different notification types
  const handlePaymentNotification = (paymentNotif: PaymentNotification) => {
    console.log('Received payment notification:', paymentNotif);
    
    // Store in Redux
    dispatch(addPaymentNotification(paymentNotif));
    
    // Store in localStorage as backup
    localStorage.setItem(`payment_${paymentNotif.bookingId}`, JSON.stringify(paymentNotif));
    
    // Show popup notification
    if (paymentNotif.status === 'success') {
      notification.success({
        message: 'Thanh toán thành công!',
        description: paymentNotif.message,
        duration: 5,
      });
    } else {
      notification.error({
        message: 'Thanh toán thất bại!',
        description: paymentNotif.message,
        duration: 5,
      });
    }
  };

  const connect = () => {
    if (!isAuthenticated || !user?.id || client.current?.connected) {
      return;
    }

    setConnectionState('CONNECTING');
    
    const newClient = new Client({
      brokerURL: 'ws://localhost:8080/chat',
      reconnectDelay: 0, // We handle reconnection manually
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectionTimeout: 3000,

      onConnect: () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionState('CONNECTED');
        reconnectAttempts.current = 0;

        console.log('WebSocket connected, ready to subscribe to payment notifications');
      },

      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
        setConnectionState('ERROR');
        scheduleReconnect();
      },

      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setConnectionState('ERROR');
        scheduleReconnect();
      },

      onDisconnect: (frame) => {
        console.log('WebSocket disconnected:', frame);
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
      console.error('Max reconnection attempts reached');
      setConnectionState('ERROR');
      return;
    }

    const delay = getReconnectDelay(reconnectAttempts.current);
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
    
    setTimeout(() => {
      reconnectAttempts.current++;
      connect();
    }, delay);
  };

  const disconnect = () => {
    unsubscribeFromPayment();
    if (client.current) {
      console.log('Disconnecting WebSocket...');
      client.current.deactivate();
      client.current = null;
      setIsConnected(false);
      setConnectionState('DISCONNECTED');
    }
  };

  const subscribeToPayment = (bookingId: number) => {
    if (!client.current?.connected) {
      console.warn('WebSocket not connected, cannot subscribe');
      return;
    }

    // Unsubscribe from previous subscription if exists
    if (subscription.current) {
      subscription.current.unsubscribe();
    }

    console.log(`Subscribing to payment notifications for booking ${bookingId}`);
    subscription.current = client.current.subscribe(`/topic/payments.${bookingId}`, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        handlePaymentNotification(parsedMessage);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
  };

  const unsubscribeFromPayment = () => {
    if (subscription.current) {
      subscription.current.unsubscribe();
      subscription.current = null;
    }
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

  const contextValue: WebSocketContextType = {
    isConnected,
    connectionState,
    subscribeToPayment,
    unsubscribeFromPayment,
    disconnect
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
