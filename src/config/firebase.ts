import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

// VAPID key for web push notifications
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    // Request permission for notifications
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });
      
      if (token) {
        return token;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onMessageListener = (): Promise<MessagePayload> => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

/**
 * Add a persistent foreground message listener (recommended)
 * Returns the unsubscribe function.
 */
export const addForegroundMessageListener = (
  callback: (payload: MessagePayload) => void
) => {
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};

/**
 * Show notification in browser
 */
export const showNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      ...options
    });
  }
};

/**
 * Check if notifications are supported
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission => {
  return Notification.permission;
};

export { messaging };
export default app;
