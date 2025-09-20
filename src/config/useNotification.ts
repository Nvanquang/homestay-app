import { useState, useEffect, useCallback } from 'react';
import { notificationService, NotificationData } from './notificationService';

interface UseNotificationReturn {
  isSupported: boolean;
  isInitialized: boolean;
  permission: NotificationPermission;
  token: string | null;
  initialize: () => Promise<boolean>;
  requestPermission: () => Promise<string | null>;
  showNotification: (data: NotificationData) => void;
  sendTokenToServer: (userId?: string) => Promise<boolean>;
}

/**
 * Custom hook for managing Firebase notifications
 */
export const useNotification = (): UseNotificationReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);

  // Check if notifications are supported
  const isSupported = 'Notification' in window && 'serviceWorker' in navigator;

  // Initialize notification service
  const initialize = useCallback(async (): Promise<boolean> => {
    try {
      const success = await notificationService.initialize();
      setIsInitialized(success);
      
      if (success) {
        setToken(notificationService.getToken());
        setPermission(notificationService.getPermissionStatus());
      }
      
      return success;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<string | null> => {
    try {
      const newToken = await notificationService.requestPermission();
      setToken(newToken);
      setPermission(notificationService.getPermissionStatus());
      return newToken;
    } catch (error) {
      console.error('Failed to request permission:', error);
      return null;
    }
  }, []);

  // Show local notification
  const showNotification = useCallback((data: NotificationData): void => {
    if (isInitialized && permission === 'granted') {
      notificationService.showLocalNotification(data);
    }
  }, [isInitialized, permission]);

  // Send token to server
  const sendTokenToServer = useCallback(async (userId?: string): Promise<boolean> => {
    if (!token) return false;
    
    try {
      return await notificationService.sendTokenToServer(token, userId);
    } catch (error) {
      console.error('Failed to send token to server:', error);
      return false;
    }
  }, [token]);

  // Update permission status on mount and when it changes
  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
      
      // Listen for permission changes
      const handlePermissionChange = () => {
        setPermission(Notification.permission);
      };

      // Note: Permission change events are not widely supported
      // This is just for future compatibility
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'notifications' }).then((result) => {
          result.addEventListener('change', handlePermissionChange);
          return () => result.removeEventListener('change', handlePermissionChange);
        });
      }
    }
  }, [isSupported]);

  return {
    isSupported,
    isInitialized,
    permission,
    token,
    initialize,
    requestPermission,
    showNotification,
    sendTokenToServer
  };
};

export default useNotification;
