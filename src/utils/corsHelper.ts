/**
 * Утилиты для работы с CORS и настройки скриптов
 */

/**
 * Загружает скрипт с обработкой CORS
 */
export const loadScriptWithCORS = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = (error) => reject(error);
    document.head.appendChild(script);
  });
};

/**
 * Загружает скрипт в no-cors режиме
 */
export const loadScriptNoCORS = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Attempting to load script via DOM: ${url}`);
      
      // Проверяем, не был ли скрипт уже загружен
      const existingScripts = document.querySelectorAll(`script[src="${url}"]`);
      if (existingScripts.length > 0) {
        console.log(`Script already loaded: ${url}`);
        resolve();
        return;
      }
      
      // Создаем новый элемент script
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = true;
      
      // Добавляем обработчики событий
      const timeoutId = setTimeout(() => {
        console.warn(`Script loading timed out after 20s: ${url}`);
        // Не вызываем reject, так как скрипт все равно может загрузиться позже
        // Просто логируем предупреждение
      }, 20000);
      
      script.onload = () => {
        clearTimeout(timeoutId);
        console.log(`Script successfully loaded: ${url}`);
        resolve();
      };
      
      script.onerror = (error) => {
        clearTimeout(timeoutId);
        console.error(`Error loading script: ${url}`, error);
        reject(new Error(`Failed to load script: ${url}`));
      };
      
      // Добавляем скрипт в DOM
      document.head.appendChild(script);
      console.log(`Script element added to DOM: ${url}`);
    } catch (error) {
      console.error(`Error creating script element for ${url}:`, error);
      reject(error);
    }
  });
};

/**
 * Загружает содержимое скрипта и выполняет его
 */
export const fetchAndEvalScript = async (url: string): Promise<void> => {
  console.log(`Fetching script content with XHR: ${url}`);
  
  return new Promise((resolve, reject) => {
    try {
      // Используем XMLHttpRequest с повышенной надежностью
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'text';
      
      // Устанавливаем заголовки для имитации обычного браузерного запроса
      xhr.setRequestHeader('Accept', '*/*');
      
      // Включаем поддержку cookies
      xhr.withCredentials = true;
      
      // Устанавливаем таймаут в 30 секунд
      xhr.timeout = 30000;
      
      // Обработка успешного ответа
      xhr.onload = () => {
        // Принимаем любой статус от 200 до 299, а также 0 (для opaque responses)
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
          try {
            // Получаем содержимое скрипта
            const scriptContent = xhr.responseText;
            
            if (!scriptContent || scriptContent.trim().length === 0) {
              console.warn(`Received empty script content from: ${url}`);
              // Считаем успешным для opaque responses
              resolve();
              return;
            }
            
            console.log(`Successfully loaded script content, length: ${scriptContent.length}`);
            
            // Выполняем скрипт через создание элемента
            const scriptElement = document.createElement('script');
            scriptElement.textContent = scriptContent;
            document.head.appendChild(scriptElement);
            
            console.log(`Script content successfully executed via script element: ${url}`);
            resolve();
          } catch (evalError) {
            console.error(`Error executing script: ${url}`, evalError);
            
            // Вторая попытка через Function
            try {
              console.log(`Trying alternative script execution method for: ${url}`);
              const evalScript = new Function(xhr.responseText);
              evalScript();
              console.log(`Script executed successfully using Function: ${url}`);
              resolve();
            } catch (fnError) {
              console.error(`All execution methods failed for script: ${url}`, fnError);
              reject(fnError);
            }
          }
        } else {
          const errorMsg = `Server returned ${xhr.status} ${xhr.statusText} for ${url}`;
          console.error(errorMsg);
          reject(new Error(errorMsg));
        }
      };
      
      // Обработчики ошибок
      xhr.onerror = (error) => {
        console.error(`Network error loading script: ${url}`, error);
        reject(new Error(`Network error loading script: ${url}`));
      };
      
      xhr.ontimeout = () => {
        console.error(`Request timed out for: ${url}`);
        reject(new Error(`Request timed out for: ${url}`));
      };
      
      xhr.onabort = () => {
        console.warn(`Request aborted for: ${url}`);
        reject(new Error(`Request aborted for: ${url}`));
      };
      
      // Отправляем запрос
      xhr.send();
      console.log(`XHR request sent for: ${url}`);
    } catch (setupError) {
      console.error(`Error setting up XHR for: ${url}`, setupError);
      reject(setupError);
    }
  });
};

/**
 * Проверяет, доступен ли ресурс через CORS
 */
export const isCORSAccessible = async (url: string): Promise<boolean> => {
  try {
    // Используем HEAD запрос для проверки доступности
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
      cache: 'no-cache',
    });
    return response.ok;
  } catch (error) {
    console.error('CORS check failed:', error);
    return false;
  }
};

/**
 * Получает URL ресурса с учетом текущего окружения
 */
export const getResourceURL = (path: string): string => {
  const isDev = process.env.NODE_ENV === 'development';
  
  // Если мы в режиме разработки и путь внешний, используем относительный путь
  if (isDev && (path.startsWith('http:') || path.startsWith('https:'))) {
    const url = new URL(path);
    return `/static${url.pathname}`;
  }
  
  // Если путь начинается с /, считаем его относительным от корня
  if (path.startsWith('/')) {
    return path;
  }
  
  // Иначе возвращаем как есть
  return path;
};

/**
 * Преобразует URL с учетом CORS ограничений
 */
export const transformURL = (url: string): string => {
  // Проверяем, является ли URL внешним
  if (url.startsWith('http:') || url.startsWith('https:')) {
    // Особая обработка для static.bro-js.ru
    if (url.includes('static.bro-js.ru')) {
      // Проверяем, является ли это запросом на index.js
      if (url.includes('/fiba/') && url.endsWith('index.js')) {
        // Логируем попытку преобразования URL
        console.log(`Перехватили запрос к static.bro-js.ru: ${url}`);
        
        // Преобразуем URL для работы через прокси
        const parsedUrl = new URL(url);
        const newUrl = `https://timurbatrshin-fiba-backend-e561.twc1.net/api/proxy/static-bro-js${parsedUrl.pathname}`;
        console.log(`Преобразовали URL с ${url} на ${newUrl}`);
        return newUrl;
      }
    }
    
    // Проверяем, относится ли URL к нашим доменам
    const isSameDomain = url.includes(window.location.hostname);
    if (!isSameDomain) {
      // Для bro-js.ru используем прокси URL
      if (url.includes('bro-js.ru')) {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname === 'static.bro-js.ru') {
          return `https://timurbatrshin-fiba-backend-e561.twc1.net/api/proxy/static-bro-js${parsedUrl.pathname}`;
        }
      }
    }
  }
  return url;
}; 