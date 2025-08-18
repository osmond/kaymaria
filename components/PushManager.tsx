'use client';

import { useEffect } from 'react';

export default function PushManager() {
  useEffect(() => {
    async function init() {
      if (!('serviceWorker' in navigator)) return;
      const registration = await navigator.serviceWorker.register('/sw.js');
      if (Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }
      const existing = await registration.pushManager.getSubscription();
      const sub =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
          ),
        }));
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });
    }
    init();
  }, []);
  return null;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
