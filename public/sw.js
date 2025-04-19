// Базовый Service Worker для кэширования ресурсов
const CACHE_NAME = 'fiba3x3-cache-v1';

// Ресурсы, которые кэшируем при установке
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Установка');
  
  // Предзагрузка ресурсов в кэш
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Кэширование ресурсов');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Активация');
  
  // Очистка старых кэшей
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('Service Worker: Удаление устаревшего кэша', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Обработка запросов - стратегия Network First
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Кэшируем копию ответа
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            // Кэшируем только успешные ответы на GET-запросы
            if (event.request.method === 'GET' && response.status === 200) {
              cache.put(event.request, responseClone);
            }
          });
        return response;
      })
      .catch(() => {
        // При ошибке сети - ищем в кэше
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Если ответа нет в кэше, оставляем ошибку как есть
          });
      })
  );
}); 