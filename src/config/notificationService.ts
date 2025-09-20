import { notification } from 'antd';
import { 
  requestNotificationPermission, 
  onMessageListener, 
  showNotification,
  isNotificationSupported,
  getNotificationPermission,
  addForegroundMessageListener
} from './firebase';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

class NotificationService {
  private fcmToken: string | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<boolean> {
    try {
      if (!isNotificationSupported()) {
        return false;
      }

      // Register service worker
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }

      // Request permission and get token
      this.fcmToken = await requestNotificationPermission();
      
      if (this.fcmToken) {
        // Listen for foreground messages
        this.setupForegroundListener();
        this.isInitialized = true;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  getToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Check if service is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Setup listener for foreground messages
   */
  private setupForegroundListener(): void {
    try {
      // Persistent listener for all foreground messages
      addForegroundMessageListener((payload) => {
        notification.success({
          message: payload.notification?.title,
          description: payload.notification?.body,
          duration: 3
      });
        // Show notification in page context
        if (payload.notification && Notification?.permission === 'granted') {
          const extraInfo = payload.data?.extra_info;
          this.showLocalNotification({
            title: payload.notification.title || 'New Message',
            body: payload.notification.body || '',
            icon: payload.notification.icon,
            data: { ...payload.data, extra_info: extraInfo },
          });
        }
      });
    } catch (error) {
      console.error('Error setting up foreground message listener:', error);
    }
  }

  /**
   * Show local notification
   */
  showLocalNotification(data: NotificationData): void {
    // Prefer PNG icon if provided; omit otherwise to avoid SVG issues
    const resolvedIcon = data.icon && data.icon.endsWith('.png') ? data.icon : undefined;
    const resolvedBadge = data.badge && data.badge.endsWith('.png') ? data.badge : undefined;

    const options: NotificationOptions = {
      body: data.body,
      icon: resolvedIcon,
      badge: resolvedBadge,
      // Use unique tag by default so each message creates a new toast
      tag: data.tag || `fcm-${Date.now()}`,
      data: data.data,
      requireInteraction: true
    };
    try {
      showNotification(data.title, options);
    } catch (e) {
      console.error('[FCM] Failed to show foreground notification:', e);
    }
  }

  /**
   * Send FCM token to backend
   */
  async sendTokenToServer(token: string, userId?: string): Promise<boolean> {
    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/notifications/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          userId
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send token to server:', error);
      return false;
    }
  }

  /**
   * Unregister token from server
   */
  async unregisterToken(token: string): Promise<boolean> {
    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/notifications/unregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to unregister token:', error);
      return false;
    }
  }

  /**
   * Check notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    return getNotificationPermission();
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<string | null> {
    this.fcmToken = await requestNotificationPermission();
    return this.fcmToken;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
