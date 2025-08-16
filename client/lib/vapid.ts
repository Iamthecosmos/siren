// VAPID (Voluntary Application Server Identification) configuration for push notifications
// In production, replace these with your actual VAPID keys from your push service

export const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // Replace with actual VAPID public key
export const VAPID_PRIVATE_KEY = 'YOUR_VAPID_PRIVATE_KEY'; // Server-side only

// Helper function to convert VAPID public key to Uint8Array
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Generate VAPID keys (run this once and save the keys)
export function generateVAPIDKeys(): { publicKey: string; privateKey: string } {
  // This is a placeholder - in production, use a proper VAPID key generation library
  // You can generate VAPID keys using: npm install web-push -g && web-push generate-vapid-keys
  return {
    publicKey: 'YOUR_VAPID_PUBLIC_KEY',
    privateKey: 'YOUR_VAPID_PRIVATE_KEY'
  };
}
