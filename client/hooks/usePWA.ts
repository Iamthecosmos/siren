import { useState, useEffect } from 'react';

interface ServiceWorkerRegistration {
  waiting: ServiceWorker | null;
  installing: ServiceWorker | null;
  active: ServiceWorker | null;
  updateViaCache: 'all' | 'imports' | 'none';
  scope: string;
  navigationPreload: NavigationPreloadManager | null;
  pushManager: PushManager;
  sync: SyncManager;
  updateFound: boolean;
  onupdatefound: ((this: ServiceWorkerRegistration, ev: Event) => any) | null;
  oncontrollerchange: ((this: ServiceWorkerRegistration, ev: Event) => any) | null;
  onstatechange: ((this: ServiceWorkerRegistration, ev: Event) => any) | null;
  addEventListener<K extends keyof ServiceWorkerRegistrationEventMap>(
    type: K,
    listener: (this: ServiceWorkerRegistration, ev: ServiceWorkerRegistrationEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof ServiceWorkerRegistrationEventMap>(
    type: K,
    listener: (this: ServiceWorkerRegistration, ev: ServiceWorkerRegistrationEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  getNotifications(options?: GetNotificationOptions): Promise<Notification[]>;
  showNotification(title: string, options?: NotificationOptions): Promise<void>;
  update(): Promise<void>;
  unregister(): Promise<boolean>;
  reload(): void;
  getPushSubscription(options?: PushSubscriptionOptions): Promise<PushSubscription | null>;
  pushManager: PushManager;
  sync: SyncManager;
}

export function usePWA() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg: ServiceWorkerRegistration) => {
          console.log('Service Worker registered successfully:', reg);
          setRegistration(reg);

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateApp = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const subscribeToPushNotifications = async () => {
    if (!registration) {
      console.log('Service Worker not registered');
      return null;
    }

    const permission = await requestNotificationPermission();
    if (!permission) {
      return null;
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'YOUR_VAPID_PUBLIC_KEY' // Replace with your VAPID public key
        ),
      });

      console.log('Push notification subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  };

  const sendTestNotification = async () => {
    if (!registration) return;

    const permission = await requestNotificationPermission();
    if (!permission) return;

    registration.showNotification('Siren Safety Alert', {
      body: 'This is a test notification from Siren',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        url: '/emergency',
      },
      actions: [
        {
          action: 'view',
          title: 'View Alert',
          icon: '/icons/icon-96x96.png',
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/icon-96x96.png',
        },
      ],
    });
  };

  return {
    registration,
    updateAvailable,
    isOnline,
    updateApp,
    requestNotificationPermission,
    subscribeToPushNotifications,
    sendTestNotification,
  };
}

// Helper function to convert VAPID public key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
