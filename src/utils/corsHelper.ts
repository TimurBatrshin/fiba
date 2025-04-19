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
    // Для bro-js.ru скриптов используем специальный подход с dynamicImport
    try {
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (error) => {
        console.error('Error loading script:', url, error);
        reject(error);
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error creating script element:', error);
      reject(error);
    }
  });
};

/**
 * Загружает содержимое скрипта и выполняет его
 */
export const fetchAndEvalScript = async (url: string): Promise<void> => {
  try {
    // Используем XMLHttpRequest вместо fetch для поддержки no-cors режима
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'text';
    
    return new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            // Выполняем код скрипта
            const scriptContent = xhr.responseText;
            const evalScript = new Function(scriptContent);
            evalScript();
            resolve();
          } catch (evalError) {
            console.error('Error evaluating script:', evalError);
            reject(evalError);
          }
        } else {
          reject(new Error(`Failed to load script: ${xhr.status}`));
        }
      };
      
      xhr.onerror = () => {
        reject(new Error('Network error loading script'));
      };
      
      xhr.send();
    });
  } catch (error) {
    console.error('Error fetching script:', error);
    throw error;
  }
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
    // Проверяем, относится ли URL к нашим доменам
    const isSameDomain = url.includes(window.location.hostname);
    if (!isSameDomain) {
      // Для bro-js.ru используем прямой URL
      if (url.includes('bro-js.ru')) {
        // Возвращаем URL как есть, потому что мы будем использовать no-cors режим
        return url;
      }
    }
  }
  return url;
}; 