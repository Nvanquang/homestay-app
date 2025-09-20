// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration (same as in main app)
const firebaseConfig = {
  apiKey: "AIzaSyBKoLs75_7lpuTNEr0s8Yx0TMaY-QzHDX8",
  authDomain: "homestay-booking-50466.firebaseapp.com",
  projectId: "homestay-booking-50466",
  storageBucket: "homestay-booking-50466.firebasestorage.app",
  messagingSenderId: "434490443957",
  appId: "1:434490443957:web:5c97df3496fbec0c6056fc",
  measurementId: "G-MBP4NCVXPB"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {

  // Extract custom data from backend
  const extraInfo = payload?.data?.extra_info;
  const link = payload?.data?.link; // optional: if backend sends a deep link or path

  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    // NOTE: Some Chromium variants on Windows prefer PNG for icon/badge.
    // If BE supplies an icon (PNG), use it; otherwise omit to avoid failures.
    icon: payload.notification?.icon || undefined,
    badge: undefined,
    // Use unique tag to avoid replacing previous notifications silently
    tag: payload.data?.tag || `msg-${Date.now()}`,
    data: {
      ...payload.data,
      extra_info: extraInfo,
      link
    },
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  // Show notification with error handling
  // self.registration.showNotification(notificationTitle, notificationOptions)
  //   .then(() => {
  //     console.log('Background notification shown:', notificationTitle);
  //   })
  //   .catch((err) => {
  //     console.error('Failed to show background notification:', err);
  //   });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const data = event.notification?.data || {};
    const targetUrl = data.link || '/';
    // Open the app when notification is clicked
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // If app is already open, focus on it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Optionally navigate to targetUrl by posting a message to the client
            client.postMessage({ type: 'notification-click', data });
            return client.focus();
          }
        }

        // If app is not open, open it
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
    );
  }
});

// Handle notification close
// self.addEventListener('notificationclose', (event) => {
//   console.log('Notification closed:', event);
// });
