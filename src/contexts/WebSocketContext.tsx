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
  const pendingBookingId = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  // Exponential backoff calculation
  const getReconnectDelay = (attempt: number): number => {
    return Math.min(baseReconnectDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
  };

  // Handle different notification types
  const handlePaymentNotification = (paymentNotif: PaymentNotification) => {
    // Store in Redux
    dispatch(addPaymentNotification(paymentNotif));
    
    // Store in localStorage as backup
    try {
      localStorage.setItem(`payment_${paymentNotif.bookingId}`, JSON.stringify(paymentNotif));
    } catch (e) {
    }
    
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
    if (!isAuthenticated || !user?.id) {
      return;
    }
    if (client.current?.connected) {
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
        setIsConnected(true);
        setConnectionState('CONNECTED');
        reconnectAttempts.current = 0;
        // If there is a pending bookingId to subscribe, do it immediately
        if (pendingBookingId.current != null) {
          const bid = pendingBookingId.current;
          subscribeToPayment(bid);
        }
      },

      onWebSocketError: (error) => {
        setConnectionState('ERROR');
        scheduleReconnect();
      },

      onStompError: (frame) => {
        setConnectionState('ERROR');
        scheduleReconnect();
      },

      onDisconnect: (frame) => {
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
      setConnectionState('ERROR');
      return;
    }

    const delay = getReconnectDelay(reconnectAttempts.current);
    setTimeout(() => {
      reconnectAttempts.current++;
      connect();
    }, delay);
  };

  const disconnect = () => {
    unsubscribeFromPayment();
    if (client.current) {
      client.current.deactivate();
      client.current = null;
      setIsConnected(false);
      setConnectionState('DISCONNECTED');
    }
  };

  const subscribeToPayment = (bookingId: number) => {
    if (!client.current?.connected) {
      pendingBookingId.current = bookingId;
      return;
    }

    // Unsubscribe from previous subscription if exists
    if (subscription.current) {
      subscription.current.unsubscribe();
    }

    const destination = `/topic/payments.${bookingId}`;
    subscription.current = client.current.subscribe(destination, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        handlePaymentNotification(parsedMessage);
      } catch (error) {
      }
    });
    // Mark current bookingId as subscribed
    pendingBookingId.current = bookingId;
  };

  const unsubscribeFromPayment = () => {
    if (subscription.current) {
      subscription.current.unsubscribe();
      subscription.current = null;
    }
    pendingBookingId.current = null;
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
