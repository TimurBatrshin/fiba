(function() {
  console.log('FIBA: Инициализация перехвата CORS-запросов...');
  
  // Базовый URL для прокси
  const PROXY_BASE_URL = 'https://timurbatrshin-fiba-backend-e561.twc1.net/api/proxy/static-bro-js';
  
  // Домены, которые требуют проксирования
  const DOMAINS_TO_PROXY = ['static.bro-js.ru'];
  
  // Проверяет, нужно ли проксировать URL
  function shouldProxyUrl(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    try {
      // Проверяем по имени домена
      return DOMAINS_TO_PROXY.some(domain => url.includes(domain));
    } catch (e) {
      console.error('FIBA Proxy: ошибка при проверке URL', e);
      return false;
    }
  }
  
  // Преобразует URL для прокси
  function transformUrlForProxy(url) {
    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname;
      
      if (DOMAINS_TO_PROXY.includes(domain)) {
        const path = parsedUrl.pathname;
        const search = parsedUrl.search || '';
        const proxyUrl = `${PROXY_BASE_URL}${path}${search}`;
        
        console.log(`FIBA Proxy: ${url} -> ${proxyUrl}`);
        return proxyUrl;
      }
    } catch (e) {
      console.error('FIBA Proxy: ошибка при трансформации URL', e);
    }
    
    return url;
  }
  
  // === ПЕРЕХВАТ FETCH ===
  const originalFetch = window.fetch;
  window.fetch = function(resource, options) {
    let url = resource;
    
    // Получаем URL из Request объекта если нужно
    if (resource instanceof Request) {
      url = resource.url;
    }
    
    if (shouldProxyUrl(url)) {
      const proxyUrl = transformUrlForProxy(url);
      
      // Создаем новый Request с прокси URL
      if (resource instanceof Request) {
        const newRequest = new Request(proxyUrl, resource);
        return originalFetch(newRequest, options);
      }
      
      return originalFetch(proxyUrl, options);
    }
    
    return originalFetch(resource, options);
  };
  
  // === ПЕРЕХВАТ XMLHttpRequest ===
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    if (shouldProxyUrl(url)) {
      const proxyUrl = transformUrlForProxy(url);
      return originalXhrOpen.call(this, method, proxyUrl, async, user, password);
    }
    
    return originalXhrOpen.call(this, method, url, async, user, password);
  };
  
  // === ПЕРЕХВАТ СОЗДАНИЯ SCRIPT ЭЛЕМЕНТОВ ===
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      // Перехват setAttribute
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name.toLowerCase() === 'src' && shouldProxyUrl(value)) {
          return originalSetAttribute.call(this, name, transformUrlForProxy(value));
        }
        return originalSetAttribute.call(this, name, value);
      };
      
      // Перехват прямого присваивания src
      const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
      if (originalSrcDescriptor && originalSrcDescriptor.set) {
        Object.defineProperty(element, 'src', {
          set: function(value) {
            if (shouldProxyUrl(value)) {
              return originalSrcDescriptor.set.call(this, transformUrlForProxy(value));
            }
            return originalSrcDescriptor.set.call(this, value);
          },
          get: originalSrcDescriptor.get,
          configurable: true
        });
      }
    }
    
    // Перехват для создания link элементов (CSS)
    if (tagName.toLowerCase() === 'link') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name.toLowerCase() === 'href' && shouldProxyUrl(value)) {
          return originalSetAttribute.call(this, name, transformUrlForProxy(value));
        }
        return originalSetAttribute.call(this, name, value);
      };
      
      // Перехват прямого присваивания href
      const originalHrefDescriptor = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href');
      if (originalHrefDescriptor && originalHrefDescriptor.set) {
        Object.defineProperty(element, 'href', {
          set: function(value) {
            if (shouldProxyUrl(value)) {
              return originalHrefDescriptor.set.call(this, transformUrlForProxy(value));
            }
            return originalHrefDescriptor.set.call(this, value);
          },
          get: originalHrefDescriptor.get,
          configurable: true
        });
      }
    }
    
    return element;
  };
  
  // === ПЕРЕХВАТ ЗАГРУЗКИ IFRAME ===
  const originalCreateElementNS = document.createElementNS;
  if (originalCreateElementNS) {
    document.createElementNS = function(namespaceURI, qualifiedName) {
      const element = originalCreateElementNS.call(document, namespaceURI, qualifiedName);
      
      if (qualifiedName.toLowerCase() === 'iframe') {
        const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'src');
        if (originalSrcDescriptor && originalSrcDescriptor.set) {
          Object.defineProperty(element, 'src', {
            set: function(value) {
              if (shouldProxyUrl(value)) {
                return originalSrcDescriptor.set.call(this, transformUrlForProxy(value));
              }
              return originalSrcDescriptor.set.call(this, value);
            },
            get: originalSrcDescriptor.get,
            configurable: true
          });
        }
      }
      
      return element;
    };
  }
  
  // === ПЕРЕХВАТ IMPORT И DYNAMIC IMPORT ===
  if (window.System && window.System.import) {
    const originalSystemImport = window.System.import;
    window.System.import = function(moduleId) {
      if (shouldProxyUrl(moduleId)) {
        return originalSystemImport.call(this, transformUrlForProxy(moduleId));
      }
      return originalSystemImport.call(this, moduleId);
    };
  }
  
  // === МОНИТОР ЗАГРУЗКИ РЕСУРСОВ НА СТРАНИЦЕ ===
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          // Проверяем скрипты
          if (node.tagName === 'SCRIPT' && node.src && shouldProxyUrl(node.src)) {
            const originalSrc = node.src;
            node.src = transformUrlForProxy(originalSrc);
            console.log(`FIBA Proxy (DOM): перехвачен script.src`, { original: originalSrc, proxy: node.src });
          }
          
          // Проверяем ссылки на CSS
          if (node.tagName === 'LINK' && node.rel === 'stylesheet' && node.href && shouldProxyUrl(node.href)) {
            const originalHref = node.href;
            node.href = transformUrlForProxy(originalHref);
            console.log(`FIBA Proxy (DOM): перехвачен link.href`, { original: originalHref, proxy: node.href });
          }
        });
      }
    });
  });
  
  // Запускаем наблюдение за DOM
  observer.observe(document, { childList: true, subtree: true });
  
  console.log('FIBA: Перехват CORS-запросов инициализирован успешно');
})(); 