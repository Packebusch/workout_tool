const CACHE_NAME = 'workout-tracker-v3.0.0-beta';
const urlsToCache = [
  '/workout_tool/',
  '/workout_tool/index.html',
  '/workout_tool/styles.css',
  '/workout_tool/privacy.html',
  '/workout_tool/imprint.html',
  '/workout_tool/manifest.json',
  '/workout_tool/src/app.js',
  '/workout_tool/src/config/constants.js',
  '/workout_tool/src/models/State.js',
  '/workout_tool/src/services/StorageManager.js',
  '/workout_tool/src/services/TimerService.js',
  '/workout_tool/src/services/WorkoutService.js',
  '/workout_tool/src/services/HistoryService.js',
  '/workout_tool/src/services/WeeklyStatsService.js',
  '/workout_tool/src/services/ChartService.js',
  '/workout_tool/src/services/WakeLockService.js',
  '/workout_tool/src/services/GoalService.js',
  '/workout_tool/src/services/SorenessService.js',
  '/workout_tool/src/services/CoachService.js',
  '/workout_tool/src/services/NotificationService.js',
  '/workout_tool/src/services/ThemeService.js',
  '/workout_tool/src/ui/UIController.js',
  '/workout_tool/src/ui/HistoryUIController.js',
  '/workout_tool/src/ui/CoachUIController.js',
  '/workout_tool/src/ui/TabNavigationController.js',
  '/workout_tool/src/ui/SettingsController.js',
  '/workout_tool/src/ui/BottomSheet.js',
  '/workout_tool/src/utils/dateUtils.js',
  '/workout_tool/src/utils/calculations.js',
  '/workout_tool/src/utils/utils.js',
  '/workout_tool/src/utils/haptics.js'
];

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first for core files, cache fallback for offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first strategy for HTML, CSS, JS (always get latest)
  if (
    request.method === 'GET' &&
    (url.pathname.endsWith('.html') ||
     url.pathname.endsWith('.css') ||
     url.pathname.endsWith('.js') ||
     url.pathname.endsWith('/'))
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Got network response, update cache and return
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((cached) => {
            return cached || caches.match('/workout_tool/index.html');
          });
        })
    );
  } else {
    // Cache-first for other resources (images, fonts, etc.)
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
  }
});

// Notification click event - handle user clicking on notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const action = data.action || 'open_app';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('/workout_tool') && 'focus' in client) {
            // Focus existing window and send message
            client.focus();
            client.postMessage({
              type: 'notification_action',
              action: action,
              data: data
            });
            return;
          }
        }

        // App not open, open new window
        if (clients.openWindow) {
          let url = '/workout_tool/';

          // Add query parameter to trigger action
          if (action === 'open_soreness_modal') {
            url += '?action=soreness';
          } else if (action === 'open_coach_panel') {
            url += '?action=coach';
          }

          return clients.openWindow(url);
        }
      })
  );
});
