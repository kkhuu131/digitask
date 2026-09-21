self.addEventListener('push', (event) => {
  const fallback = {
    title: 'Digitask Reminder',
    body: 'You have goals waiting in Digitask.',
    url: '/',
  };
  let payload = fallback;
  try {
    payload = { ...fallback, ...event.data.json() };
  } catch {
    if (event.data) payload.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/digitask-192.png',
      badge: '/icons/digitask-192.png',
      tag: 'digitask-daily-reminder',
      renotify: false,
      data: { url: payload.url },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => client.url.startsWith(self.location.origin));
      if (existing) {
        existing.navigate(target);
        return existing.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
