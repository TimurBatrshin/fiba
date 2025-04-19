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
        return url.replace('https://static.bro-js.ru', window.location.origin);
      }
    }
  }
  return url;
}; 