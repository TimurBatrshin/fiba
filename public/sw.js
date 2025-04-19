// Service Worker для обхода CORS ограничений
const CACHE_NAME = 'fiba-cache-v1';
const BRO_JS_DOMAINS = ['static.bro-js.ru', 'dev.bro-js.ru'];

// Проверяем, относится ли URL к статическим ресурсам bro-js
const isBroJsUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return BRO_JS_DOMAINS.some(domain => urlObj.hostname === domain && urlObj.pathname.includes('/fiba/'));
  } catch (e) {
    return false;
  }
};

// Проверяем, является ли URL прокси-запросом
const isProxyRequest = (url) => {
  return url.pathname.startsWith('/proxy/');
};

// Преобразование URL прокси в реальный URL
const getActualUrlFromProxy = (url) => {
  const path = url.pathname.replace('/proxy', '');
  const staticUrl = `https://static.bro-js.ru${path}`;
  const timestamp = url.searchParams.get('t');
  
  return timestamp ? `${staticUrl}?t=${timestamp}` : staticUrl;
};

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Установка');
  
  // Пропускаем фазу ожидания и активируем сразу
  event.waitUntil(self.skipWaiting());
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Активация');
  
  // Устанавливаем этот SW как активный для всех клиентов
  event.waitUntil(self.clients.claim());
  
  // Очищаем старые кэши
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Удаляем старый кэш', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехват fetch запросов
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Если это запрос к прокси
  if (isProxyRequest(url)) {
    console.log('Service Worker: Перехват прокси-запроса', url.pathname);
    
    // Получаем реальный URL 
    const actualUrl = getActualUrlFromProxy(url);
    console.log('Service Worker: Преобразовано в', actualUrl);
    
    // Создаем новый запрос с CORS заголовками
    const newRequest = new Request(actualUrl, {
      method: event.request.method,
      headers: {
        'Origin': self.location.origin
      },
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow'
    });
    
    // Выполняем запрос
    event.respondWith(
      fetch(newRequest)
        .then(response => {
          // Клонируем ответ, так как он может быть использован только один раз
          const clonedResponse = response.clone();
          
          // Кэшируем ответ
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          
          // Создаем новый ответ с CORS заголовками
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: {
              ...Object.fromEntries(response.headers.entries()),
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              'Cross-Origin-Resource-Policy': 'cross-origin'
            }
          });
        })
        .catch(error => {
          console.error('Service Worker: Ошибка сетевого запроса', error);
          
          // Проверяем кэш
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              console.log('Service Worker: Возвращаем из кэша', event.request.url);
              return cachedResponse;
            }
            
            // Если в кэше нет, возвращаем ошибку
            return new Response('Не удалось загрузить ресурс', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        })
    );
    return;
  }
  
  // Если это запрос к Bro JS доменам, но не через прокси - перенаправляем
  if (isBroJsUrl(event.request.url)) {
    const urlObj = new URL(event.request.url);
    const proxyUrl = `${self.location.origin}/proxy${urlObj.pathname}`;
    
    console.log('Service Worker: Перенаправление на прокси', proxyUrl);
    
    event.respondWith(
      fetch(proxyUrl, {
        method: event.request.method,
        cache: 'no-cache',
        redirect: 'follow'
      })
    );
    return;
  }
  
  // Для остальных запросов не вмешиваемся
  // Но добавляем проверку кэша для оффлайн-режима
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
}); 