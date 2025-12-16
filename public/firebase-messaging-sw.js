importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyDpRRGzAaShaPoukLPVbSeGTbU1YgLYRr4',
  authDomain: 'autoplanner-4c4d4.firebaseapp.com',
  projectId: 'autoplanner-4c4d4',
  storageBucket: 'autoplanner-4c4d4.firebasestorage.app',
  messagingSenderId: '337182678714',
  appId: '1:337182678714:web:b2bc3fe7a44478a66dac83',
  measurementId: 'G-DBBSNHWRBS'
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
