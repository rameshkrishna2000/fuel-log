import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  Messaging
} from 'firebase/messaging';

const firebase = import.meta.env;
// Firebase configuration
const firebaseConfig = {
  apiKey: firebase.VITE_APP_FIREBASE_API_KEY,
  authDomain: firebase.VITE_APP_FIREBASE_AUTHDOMAIN,
  projectId: firebase.VITE_APP_FIREBASE_PROJECTID,
  storageBucket: firebase.VITE_APP_FIREBASE_STORAGEBUCKET,
  messagingSenderId: firebase.VITE_APP_FIREBASE_MESSAGINGID,
  appId: firebase.VITE_APP_FIREBASE_APPID,
  measurementId: firebase.VITE_APP_FIREBASE_MEASUREMENTID
};
// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

let messaging: Messaging | null = null;
let currentToken: string | null = null;

// Initialize Firebase Messaging
export const initializeMessaging = async (): Promise<Messaging | null> => {
  const supported = await isSupported();
  if (supported) {
    messaging = getMessaging(app);
    return messaging;
  } else {
    console.warn('Firebase messaging is not supported in this browser.');
    return null;
  }
};

// Request permission and get token
export const requestPermission = async (): Promise<string | null> => {
  if (!messaging) {
    await initializeMessaging();
  }

  try {
    const permission = Notification.permission;
    if (permission !== 'granted') {
      console.warn('Notification permission not granted.');
      return null;
    }

    currentToken = await getToken(messaging!, {
      vapidKey: firebase.VITE_APP_FIREBASE_VAPIDKEY
    });

    if (currentToken) {
      return currentToken;
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
};

// Get the current token if available
export const getCurrentToken = async (): Promise<string | null> => {
  if (!messaging) {
    await initializeMessaging();
  }

  try {
    currentToken = await getToken(messaging!, {
      vapidKey: firebase.VITE_APP_FIREBASE_VAPIDKEY
    });
    return currentToken;
  } catch (err) {
    return null;
  }
};

// Handle incoming messages
export const onMessageListener = async (): Promise<any> => {
  if (!messaging) {
    await initializeMessaging();
  }

  return new Promise(resolve => {
    onMessage(messaging!, payload => {
      resolve(payload);
    });
  });
};
