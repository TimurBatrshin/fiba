/**
 * Настройка прокси для обхода CORS-ограничений при разработке
 * 
 * Этот файл настраивает прокси-сервер, который перенаправляет запросы
 * к статическим ресурсам через локальный сервер разработки,
 * что позволяет избежать проблем с CORS.
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Прокси для статических ресурсов
  app.use(
    '/static',
    createProxyMiddleware({
      target: 'https://static.bro-js.ru',
      changeOrigin: true,
      secure: false,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      pathRewrite: {
        '^/static': '/apps/FIBA3x3/1.6.3'
      },
      onProxyRes: function(proxyRes) {
        // Добавление CORS-заголовков к ответу
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
      }
    })
  );

  // Прокси для API
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://timurbatrshin-fiba-backend-7cf2.twc1.net',
      changeOrigin: true,
      secure: false,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    })
  );
}; 