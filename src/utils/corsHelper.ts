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
    console.log('Using XHR to fetch script:', url);
    
    // Используем XMLHttpRequest вместо fetch для поддержки no-cors режима
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'text';
    xhr.withCredentials = true; // Включаем поддержку куки
    
    return new Promise((resolve, reject) => {
      xhr.onload = () => {
        // Принимаем любой статус от 200 до 299, а также 0 (для no-cors)
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
          try {
            // Получаем текст ответа
            const scriptContent = xhr.responseText;
            
            // Проверяем, что мы действительно получили JavaScript
            if (!scriptContent || scriptContent.trim().length === 0) {
              console.warn('Received empty script content from:', url);
              // Все равно считаем успешным, так как это может быть opaque response
              resolve();
              return;
            }
            
            console.log('Successfully loaded script, length:', scriptContent.length);
            
            // Выполняем код скрипта в глобальном контексте
            try {
              const evalScript = new Function(scriptContent);
              evalScript();
              console.log('Script evaluated successfully:', url);
              resolve();
            } catch (evalError) {
              console.error('Error evaluating script:', evalError);
              
              // Пробуем альтернативный метод выполнения
              try {
                const scriptElement = document.createElement('script');
                scriptElement.textContent = scriptContent;
                document.head.appendChild(scriptElement);
                console.log('Script executed via script tag insertion');
                resolve();
              } catch (scriptError) {
                console.error('Failed to execute script via tag insertion:', scriptError);
                reject(scriptError);
              }
            }
          } catch (evalError) {
            console.error('Error processing script:', evalError);
            reject(evalError);
          }
        } else {
          const errorMsg = `Failed to load script: ${xhr.status} ${xhr.statusText}`;
          console.error(errorMsg);
          reject(new Error(errorMsg));
        }
      };
      
      xhr.onerror = (error) => {
        console.error('Network error loading script:', error);
        reject(new Error('Network error loading script'));
      };
      
      xhr.ontimeout = () => {
        console.error('Timeout loading script:', url);
        reject(new Error('Timeout loading script'));
      };
      
      xhr.onabort = () => {
        console.error('Script loading aborted:', url);
        reject(new Error('Script loading aborted'));
      };
      
      // Устанавливаем таймаут в 15 секунд
      xhr.timeout = 15000;
      
      xhr.send();
    });
  } catch (error) {
    console.error('Error setting up XHR for script:', error);
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