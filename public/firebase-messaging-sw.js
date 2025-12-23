importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyCwHc3wzOTOrwzwin0ZqHxx8apy_qd--j0',
  authDomain: 'autoplanner-172bc.firebaseapp.com',
  projectId: 'autoplanner-172bc',
  storageBucket: 'autoplanner-172bc.firebasestorage.app',
  messagingSenderId: '632127467776',
  appId: '1:632127467776:web:d676d298787e52886603e5',
  measurementId: 'G-JN2E06TBRY'
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage(payload => {
  console.log('Received background message: ', payload);
  const notificationTitle =
    payload.notification?.title?.replace(/([a-z])([A-Z])/g, '$1 $2') ||
    'Background Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'No message body',
    data: { url: payload.data?.click_action || '/' }
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url !== targetUrl && 'navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
