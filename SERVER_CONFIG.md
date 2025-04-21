# Настройка сервера для приложения FIBA 3x3

Данный документ содержит инструкции по настройке веб-сервера для корректной работы приложения FIBA 3x3 версии 1.6.1 и выше.

## Структура директорий на сервере

Приложение должно быть развернуто в следующей структуре:

```
/var/www/html/apps/FIBA3x3/1.6.1/ - файлы версии 1.6.1
/var/www/html/apps/FIBA3x3/1.6.0/ - файлы версии 1.6.0
... и так далее для других версий
```

## Настройка CORS

Для корректной работы приложения необходимо настроить CORS-заголовки на сервере. Ниже приведен пример конфигурации для Nginx:

```nginx
# Настройка для статических файлов
location /apps/FIBA3x3/ {
    alias /var/www/html/apps/FIBA3x3/;
    
    # CORS заголовки
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    
    # Если запрос OPTIONS, сразу возвращаем 200
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
    
    try_files $uri $uri/ =404;
}

# Настройка для SPA (Single Page Application)
location /fiba {
    alias /var/www/html/apps/FIBA3x3/1.6.1/;
    try_files $uri /index.html;
}

# Перенаправление с корня на /fiba
location = / {
    return 301 /fiba;
}
```

## Проверка настроек

Для проверки корректности настроек выполните следующие запросы:

1. `curl -I https://your-server.com/apps/FIBA3x3/1.6.1/index.js` - должен вернуть код 200 с правильными CORS-заголовками
2. `curl -I https://your-server.com/fiba` - должен вернуть код 200

## Обновление приложения

При выпуске новой версии приложения:

1. Загрузите файлы в новую директорию, соответствующую номеру версии (например, `/var/www/html/apps/FIBA3x3/1.6.2/`)
2. Обновите alias в конфигурации Nginx для location `/fiba` на новую версию
3. Перезагрузите конфигурацию Nginx командой `sudo nginx -s reload`

## Устранение неполадок

### Проблема: 404 ошибка при доступе к приложению

1. Проверьте, что файлы приложения находятся в правильной директории
2. Убедитесь, что конфигурация Nginx правильно настроена
3. Проверьте логи ошибок Nginx: `sudo tail -f /var/log/nginx/error.log`

### Проблема: CORS-ошибки

1. Убедитесь, что в конфигурации Nginx добавлены правильные CORS-заголовки
2. Проверьте, что заголовки добавляются для всех необходимых типов файлов
3. Перезагрузите конфигурацию Nginx

### Проблема: Приложение не загружает статические ресурсы

1. Проверьте, что пути к статическим ресурсам в приложении соответствуют структуре директорий на сервере
2. Убедитесь, что файлы имеют правильные права доступа
3. Проверьте, что в конфигурации Nginx нет ограничений на доступ к статическим файлам 