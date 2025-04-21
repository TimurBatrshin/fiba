import React, { useEffect, useState } from 'react';
import { proxyService } from '../api';

interface ScriptLoaderProps {
  urls: string | string[];
  onLoad?: () => void;
  onError?: (error: Error) => void;
  fallbackToProxy?: boolean;
  children?: React.ReactNode;
}

/**
 * Компонент для безопасной загрузки внешних скриптов с отслеживанием состояния загрузки
 */
const ScriptLoader: React.FC<ScriptLoaderProps> = ({
  urls,
  onLoad,
  onError,
  fallbackToProxy = true,
  children
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const scriptUrls = Array.isArray(urls) ? urls : [urls];
    let isMounted = true;

    const loadScript = async (url: string): Promise<void> => {
      try {
        // Проверяем, загружен ли скрипт уже
        const existingScript = document.querySelector(`script[src="${url}"]`);
        if (existingScript) {
          console.log(`Скрипт уже загружен: ${url}`);
          return;
        }

        // Проверяем, является ли URL относительным или абсолютным
        const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
        const isCorsError = isAbsoluteUrl && (
          url.includes('static.bro-js.ru') || 
          url.includes('dev.bro-js.ru') || 
          url.includes('fiba3x3')
        );
        
        // Для ресурсов с известными CORS-проблемами сразу используем прокси
        if (isCorsError && fallbackToProxy) {
          console.log(`Используем прокси для скрипта с известными CORS-проблемами: ${url}`);
          await proxyService.loadScript(url);
          return;
        }

        // Создаем элемент script
        const script = document.createElement('script');
        script.src = url;
        script.async = true;

        // Обработчики событий
        const loadPromise = new Promise<void>((resolve, reject) => {
          script.onload = () => {
            console.log(`Скрипт загружен успешно: ${url}`);
            resolve();
          };

          script.onerror = (e) => {
            console.error(`Ошибка загрузки скрипта: ${url}`, e);
            reject(new Error(`Не удалось загрузить скрипт: ${url}`));
          };
        });

        // Добавляем элемент в DOM
        document.head.appendChild(script);

        // Ожидаем загрузки
        await loadPromise;
      } catch (loadError) {
        if (fallbackToProxy) {
          console.log(`Пробуем загрузить через прокси: ${url}`);
          await proxyService.loadScript(url);
        } else {
          throw loadError;
        }
      }
    };

    const loadAllScripts = async () => {
      try {
        // Загружаем скрипты последовательно для обеспечения правильного порядка
        for (const url of scriptUrls) {
          await loadScript(url);
        }

        if (isMounted) {
          setLoading(false);
          onLoad?.();
        }
      } catch (err) {
        const loadError = err instanceof Error ? err : new Error(String(err));
        
        if (isMounted) {
          setError(loadError);
          setLoading(false);
          onError?.(loadError);
        }
      }
    };

    loadAllScripts();

    return () => {
      isMounted = false;
    };
  }, [urls, onLoad, onError, fallbackToProxy]);

  if (error) {
    return (
      <div className="script-loader-error">
        Ошибка загрузки скриптов: {error.message}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="script-loader-loading">
        Загрузка необходимых ресурсов...
      </div>
    );
  }

  return <>{children}</>;
};

export default ScriptLoader; 