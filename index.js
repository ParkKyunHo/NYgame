import "expo-router/entry";

// Register Service Worker for PWA offline support (web only)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.log('[PWA] Service Worker registration failed:', error);
      });
  });
}
