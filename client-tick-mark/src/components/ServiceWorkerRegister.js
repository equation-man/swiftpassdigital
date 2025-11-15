"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered with scope:', registration.scope);
        } catch (err) {
          console.error('Service Worker registration failed:', err);
        }
      });
    }
  }, []);

  return null;
}

