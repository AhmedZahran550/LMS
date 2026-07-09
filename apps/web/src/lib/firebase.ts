import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, Messaging } from 'firebase/messaging';

let firebaseConfig: any = {};
try {
  if (process.env.NEXT_PUBLIC_FIREBASE_CONFIG) {
    firebaseConfig = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
  }
} catch (error) {
  console.error('Failed to parse NEXT_PUBLIC_FIREBASE_CONFIG JSON string', error);
}

// Initialize Firebase only if config is provided
const app = !getApps().length && firebaseConfig.apiKey 
  ? initializeApp(firebaseConfig) 
  : getApps().length ? getApp() : null;

let messaging: Messaging | null = null;
if (typeof window !== 'undefined' && app && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Failed to initialize Firebase Messaging', error);
  }
}

export { app, messaging };

export const requestFCMToken = async (): Promise<string | undefined> => {
  if (!messaging) return undefined;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      return token;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }
  return undefined;
};
