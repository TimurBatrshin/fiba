// CORS-детектор для FIBA
(function() {
  console.log('FIBA CORS Detector: инициализация...');
  
  // Логи CORS-ошибок
  const corsErrors = [];
  
  // Оригинальный console.error
  const originalConsoleError = console.error;
  
  // Перехватываем console.error для детектирования CORS-ошибок
  console.error = function(...args) {
    const errorText = args.join(' ');
    
    // Проверяем на CORS-ошибки
    if (
      errorText.includes('CORS') || 
      errorText.includes('cross-origin') || 
      errorText.includes('Access-Control-Allow-Origin')
    ) {
      const timestamp = new Date().toISOString();
      const error = {
        timestamp,
        message: errorText,
        url: window.location.href,
        stack: new Error().stack
      };
      
      corsErrors.push(error);
      
      // Сохраняем в localStorage для последующего анализа
      try {
        localStorage.setItem('fiba_cors_errors', JSON.stringify(corsErrors));
      } catch (e) {
        // Если localStorage недоступен, игнорируем ошибку
      }
      
      // Добавляем информацию в консоль
      originalConsoleError.apply(console, [
        '%c[FIBA CORS Detector]%c CORS ошибка обнаружена!',
        'color: red; font-weight: bold',
        'color: red',
        error
      ]);
    }
    
    // Вызываем оригинальный console.error
    return originalConsoleError.apply(console, args);
  };
  
  // Перехватываем события загрузки ресурсов
  window.addEventListener('error', function(event) {
    if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK' || event.target.tagName === 'IMG')) {
      const url = event.target.src || event.target.href;
      
      if (url && (url.includes('static.bro-js.ru') || url.includes('dev.bro-js.ru'))) {
        const timestamp = new Date().toISOString();
        const error = {
          timestamp,
          type: 'resource_error',
          url: url,
          element: event.target.tagName,
          pageUrl: window.location.href
        };
        
        corsErrors.push(error);
        
        try {
          localStorage.setItem('fiba_cors_errors', JSON.stringify(corsErrors));
        } catch (e) {
          // Игнорируем ошибки localStorage
        }
        
        console.warn(
          '%c[FIBA CORS Detector]%c Ошибка загрузки ресурса',
          'color: orange; font-weight: bold',
          'color: orange',
          error
        );
      }
    }
  }, true);
  
  // Сохраняем глобальный доступ к детектору
  window.__fibaCorsDetector = {
    getErrors: function() {
      return [...corsErrors];
    },
    clearErrors: function() {
      corsErrors.length = 0;
      try {
        localStorage.removeItem('fiba_cors_errors');
      } catch (e) {
        // Игнорируем ошибки localStorage
      }
    },
    checkUrl: function(url) {
      if (!url) return false;
      
      try {
        fetch(url)
          .then(response => {
            console.log(
              '%c[FIBA CORS Detector]%c URL проверен успешно',
              'color: green; font-weight: bold',
              'color: green',
              { url, status: response.status, ok: response.ok }
            );
            return response.text();
          })
          .then(text => {
            console.log(
              '%c[FIBA CORS Detector]%c Содержимое получено',
              'color: green; font-weight: bold',
              'color: green',
              { url, size: text.length }
            );
          })
          .catch(error => {
            console.error(
              '%c[FIBA CORS Detector]%c Ошибка при проверке URL',
              'color: red; font-weight: bold',
              'color: red',
              { url, error }
            );
          });
      } catch (e) {
        console.error(
          '%c[FIBA CORS Detector]%c Ошибка при проверке URL',
          'color: red; font-weight: bold',
          'color: red',
          { url, error: e }
        );
      }
    }
  };
  
  // Проверка прокси
  setTimeout(function() {
    const proxyUrl = 'https://timurbatrshin-fiba-backend-e561.twc1.net/api/proxy/static-bro-js/fiba3x3/1.6.5/index.js';
    window.__fibaCorsDetector.checkUrl(proxyUrl);
  }, 1000);
  
  console.log('FIBA CORS Detector: инициализирован успешно');
})(); 