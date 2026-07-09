importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Listen for push messages when app is in background
// We defer initialization until we actually receive a push to avoid errors
// if config is missing, but FCM needs the sender ID at least.

self.addEventListener('push', function (event) {
  if (!firebase.apps.length) {
    // We try to pull config from the query params of the registration URL if possible, 
    // but the easiest way is to hardcode it or inject it during build.
    // For simplicity, we initialize it if we have the config.
    // Alternatively, just let the server send full notification payload and we show it.
  }

  const data = event.data?.json() ?? {};
  
  // If the server sends a full 'notification' object in the FCM payload, 
  // Firebase will automatically show the notification and we don't strictly 
  // need to call showNotification here unless it's a data-only message.
  
  if (data.notification) {
    const title = data.notification.title;
    const options = {
      body: data.notification.body,
      icon: '/next.svg', // Default icon
      data: data.data,
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  // Try to open the app or focus the existing tab
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus if we already have it open
      for (const client of clientList) {
        if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        // Here we could use event.notification.data to navigate to specific page
        return clients.openWindow('/');
      }
    })
  );
});
