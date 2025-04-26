# FIBA 3x3 Basketball Tournament Management

Приложение для управления турнирами по баскетболу 3x3.

## Структура проекта

- `fiba_backend` - Backend на Java Spring Boot (развернут на удаленном сервере)
- `src` - Frontend на React/TypeScript

## Требования

- Node.js 14+ и npm

## Настройка

Бэкенд уже развернут на удаленном сервере:
`https://timurbatrshin-fiba-backend-5ef6.twc1.net`

Конфигурация фронтенда настроена на работу с этим бэкендом.

## Запуск приложения

### Запуск фронтенда

```
npm start
```

## Доступ к приложению

- Frontend: http://localhost:8099
- Backend API: https://timurbatrshin-fiba-backend-5ef6.twc1.net/api
- API документация: https://timurbatrshin-fiba-backend-5ef6.twc1.net/swagger-ui

## Учетные данные для тестирования

- Пользователь: Timur007@example.com
- Пароль: qwerty123

## API Endpoints

Основные эндпоинты API:

### Аутентификация

- **POST** `/api/auth/login` - Авторизация пользователя
- **POST** `/api/auth/register` - Регистрация нового пользователя
- **POST** `/api/auth/refresh-token` - Обновление токена

### Турниры

- **GET** `/api/tournaments` - Получение всех турниров
- **GET** `/api/tournaments/{id}` - Получение турнира по ID
- **GET** `/api/tournaments/upcoming` - Предстоящие турниры
- **GET** `/api/tournaments/past` - Прошедшие турниры
- **GET** `/api/tournaments/search?query={query}` - Поиск турниров
- **POST** `/api/tournaments` - Создание турнира (требуется роль Admin)
- **POST** `/api/tournaments/business` - Создание бизнес-турнира (требуется роль Admin или Business)
- **POST** `/api/tournaments/{id}/register` - Регистрация команды на турнир

## Интеграция фронтенда с бэкендом

Взаимодействие фронтенда с бэкендом осуществляется через следующие файлы:

1. `src/config/envConfig.ts` - Конфигурация URL-адресов API и статических файлов
2. `src/api/client.ts` - HTTP-клиент на основе Axios для работы с API
3. `src/api/auth.ts` - Сервис аутентификации
4. `src/api/tournaments.ts` - Сервис для работы с турнирами
5. `src/api/index.ts` - Экспорт всех API-сервисов

## Особенности работы с API

1. **Аутентификация**
   - При успешном входе/регистрации токен JWT сохраняется в localStorage
   - Все последующие запросы автоматически включают токен в заголовок Authorization
   - При получении ошибки 401 (Unauthorized) происходит редирект на страницу входа

2. **Обработка ошибок**
   - Все ошибки API обрабатываются централизованно в client.ts
   - При ошибках CORS или сети выдается понятное сообщение
   - Для методов, которые должны возвращать массивы, при ошибке возвращается пустой массив

3. **Загрузка файлов**
   - Для загрузки изображений используется FormData
   - Поддерживается загрузка изображений для турниров и спонсоров

## Основные функции

- Регистрация и авторизация пользователей
- Создание и управление турнирами
- Управление командами и игроками
- Регистрация команд на турниры
- Просмотр статистики

## Технологии

### Backend (развернут на удаленном сервере)
- Java 19
- Spring Boot 3.2.3
- Spring Security с JWT
- Spring Data JPA
- PostgreSQL
- Swagger/OpenAPI

### Frontend
- React 17
- TypeScript
- Redux Toolkit
- React Router
- Axios
- React Bootstrap
- Styled Components 