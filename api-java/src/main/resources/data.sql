-- Очистка таблиц перед заполнением (в обратном порядке зависимостей)
TRUNCATE TABLE player_team, ad_results, ads, registrations, tournaments, profiles, users CASCADE;

-- Сбросить последовательности
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE tournaments_id_seq RESTART WITH 1;
ALTER SEQUENCE registrations_id_seq RESTART WITH 1;
ALTER SEQUENCE ads_id_seq RESTART WITH 1;
ALTER SEQUENCE ad_results_id_seq RESTART WITH 1;

-- Заполнение таблицы пользователей
-- Пароль: password (хэшированный с bcrypt)
INSERT INTO users (name, email, password, email_verified, role, created_at, updated_at) VALUES
-- Админ
('Администратор', 'admin@fiba-tournaments.com', '$2a$10$TyGdxltzAMwOlkC2nXWnDOK8cJ.aS0AexzaY4aQlmzr3/zK4gBjI.', true, 'admin', NOW(), NOW()),
-- Игроки
('Тимур', 'batrshintimur.batrshin@gmail.com', '$2a$10$TyGdxltzAMwOlkC2nXWnDOK8cJ.aS0AexzaY4aQlmzr3/zK4gBjI.', true, 'user', NOW(), NOW()),
('Иван Петров', 'ivan@example.com', '$2a$10$TyGdxltzAMwOlkC2nXWnDOK8cJ.aS0AexzaY4aQlmzr3/zK4gBjI.', true, 'user', NOW(), NOW()),
('Алексей Смирнов', 'alexei@example.com', '$2a$10$TyGdxltzAMwOlkC2nXWnDOK8cJ.aS0AexzaY4aQlmzr3/zK4gBjI.', true, 'user', NOW(), NOW()),
('Михаил Иванов', 'mikhail@example.com', '$2a$10$TyGdxltzAMwOlkC2nXWnDOK8cJ.aS0AexzaY4aQlmzr3/zK4gBjI.', true, 'user', NOW(), NOW()),
('Сергей Попов', 'sergey@example.com', '$2a$10$TyGdxltzAMwOlkC2nXWnDOK8cJ.aS0AexzaY4aQlmzr3/zK4gBjI.', true, 'user', NOW(), NOW()),
('Дмитрий Козлов', 'dmitry@example.com', '$2a$10$TyGdxltzAMwOlkC2nXWnDOK8cJ.aS0AexzaY4aQlmzr3/zK4gBjI.', true, 'user', NOW(), NOW()),
('Николай Морозов', 'nikolay@example.com', '$2a$10$TyGdxltzAMwOlkC2nXWnDOK8cJ.aS0AexzaY4aQlmzr3/zK4gBjI.', true, 'user', NOW(), NOW()),
('Анна Иванова', 'anna@example.com', '$2a$10$TyGdxltzAMwOlkC2nXWnDOK8cJ.aS0AexzaY4aQlmzr3/zK4gBjI.', true, 'user', NOW(), NOW()),
('Елена Смирнова', 'elena@example.com', '$2a$10$TyGdxltzAMwOlkC2nXWnDOK8cJ.aS0AexzaY4aQlmzr3/zK4gBjI.', true, 'user', NOW(), NOW()),
-- Рекламодатели
('Adidas Россия', 'adidas@example.com', '$2a$10$TyGdxltzAMwOlkC2nXWnDOK8cJ.aS0AexzaY4aQlmzr3/zK4gBjI.', true, 'business', NOW(), NOW()),
('Nike Россия', 'nike@example.com', '$2a$10$TyGdxltzAMwOlkC2nXWnDOK8cJ.aS0AexzaY4aQlmzr3/zK4gBjI.', true, 'business', NOW(), NOW()),
('Under Armour', 'underarmour@example.com', '$2a$10$TyGdxltzAMwOlkC2nXWnDOK8cJ.aS0AexzaY4aQlmzr3/zK4gBjI.', true, 'business', NOW(), NOW()),
('Спортмастер', 'sportmaster@example.com', '$2a$10$TyGdxltzAMwOlkC2nXWnDOK8cJ.aS0AexzaY4aQlmzr3/zK4gBjI.', true, 'business', NOW(), NOW()),
('Агентство "СпортМаркетинг"', 'sportmarketing@example.com', '$2a$10$TyGdxltzAMwOlkC2nXWnDOK8cJ.aS0AexzaY4aQlmzr3/zK4gBjI.', true, 'advertiser', NOW(), NOW()),
('Рекламное агентство "Хук"', 'hook@example.com', '$2a$10$TyGdxltzAMwOlkC2nXWnDOK8cJ.aS0AexzaY4aQlmzr3/zK4gBjI.', true, 'advertiser', NOW(), NOW());

-- Заполнение таблицы профилей
INSERT INTO profiles (user_id, photo_url, avatar_url, bio, phone_number, city, age, tournaments_played, total_points, rating, created_at, updated_at) VALUES
(1, NULL, '/images/default-avatar.png', 'Администратор системы', '+7 (999) 123-45-67', 'Москва', 35, 0, 0, 0, NOW(), NOW()),
(2, '/uploads/profile-photos/user2.jpg', '/uploads/avatars/user2.jpg', 'Профессиональный баскетболист, капитан команды "Тигры"', '+7 (999) 123-45-68', 'Казань', 28, 15, 320, 85, NOW(), NOW()),
(3, '/uploads/profile-photos/user3.jpg', '/uploads/avatars/user3.jpg', 'Любитель баскетбола с 10-летним стажем', '+7 (999) 123-45-69', 'Москва', 32, 12, 245, 78, NOW(), NOW()),
(4, '/uploads/profile-photos/user4.jpg', '/uploads/avatars/user4.jpg', 'Играю в баскетбол с детства, участвую в любительских турнирах', '+7 (999) 123-45-70', 'Санкт-Петербург', 29, 8, 180, 65, NOW(), NOW()),
(5, '/uploads/profile-photos/user5.jpg', '/uploads/avatars/user5.jpg', 'Центровой, ищу команду для серьезных турниров', '+7 (999) 123-45-71', 'Екатеринбург', 31, 20, 410, 90, NOW(), NOW()),
(6, '/uploads/profile-photos/user6.jpg', '/uploads/avatars/user6.jpg', 'Разыгрывающий защитник, бывший профессиональный игрок', '+7 (999) 123-45-72', 'Нижний Новгород', 34, 25, 520, 92, NOW(), NOW()),
(7, '/uploads/profile-photos/user7.jpg', '/uploads/avatars/user7.jpg', 'Играю за команду "Метеор"', '+7 (999) 123-45-73', 'Краснодар', 27, 10, 210, 70, NOW(), NOW()),
(8, '/uploads/profile-photos/user8.jpg', '/uploads/avatars/user8.jpg', 'Капитан команды "Вихрь", участник международных турниров', '+7 (999) 123-45-74', 'Казань', 33, 18, 380, 88, NOW(), NOW()),
(9, '/uploads/profile-photos/user9.jpg', '/uploads/avatars/user9.jpg', 'Игрок женской команды "Комета"', '+7 (999) 123-45-75', 'Москва', 26, 15, 290, 82, NOW(), NOW()),
(10, '/uploads/profile-photos/user10.jpg', '/uploads/avatars/user10.jpg', 'Капитан женской команды "Искра"', '+7 (999) 123-45-76', 'Санкт-Петербург', 28, 16, 310, 85, NOW(), NOW()),
(11, NULL, '/uploads/avatars/adidas.jpg', 'Официальное представительство Adidas в России', '+7 (495) 123-45-77', 'Москва', NULL, 0, 0, 0, NOW(), NOW()),
(12, NULL, '/uploads/avatars/nike.jpg', 'Официальное представительство Nike в России', '+7 (495) 123-45-78', 'Москва', NULL, 0, 0, 0, NOW(), NOW()),
(13, NULL, '/uploads/avatars/underarmour.jpg', 'Официальное представительство Under Armour в России', '+7 (495) 123-45-79', 'Москва', NULL, 0, 0, 0, NOW(), NOW()),
(14, NULL, '/uploads/avatars/sportmaster.jpg', 'Сеть спортивных магазинов "Спортмастер"', '+7 (495) 123-45-80', 'Москва', NULL, 0, 0, 0, NOW(), NOW()),
(15, NULL, '/uploads/avatars/sportmarketing.jpg', 'Рекламное агентство спортивного маркетинга', '+7 (495) 123-45-81', 'Москва', NULL, 0, 0, 0, NOW(), NOW()),
(16, NULL, '/uploads/avatars/hook.jpg', 'Специализируемся на спортивных мероприятиях', '+7 (495) 123-45-82', 'Санкт-Петербург', NULL, 0, 0, 0, NOW(), NOW());

-- Заполнение таблицы турниров
INSERT INTO tournaments (title, date, location, level, prize_pool, status, sponsor_name, sponsor_logo, business_type, created_at, updated_at) VALUES
('Весенний Кубок FIBA 2025', '2025-05-15 10:00:00', 'Москва, СК "Олимпийский"', 'Профессиональный', 1000000, 'registration', 'Adidas', '/uploads/sponsors/adidas.jpg', 'Спортивные товары', NOW(), NOW()),
('Любительский турнир 3x3', '2025-06-10 12:00:00', 'Санкт-Петербург, Площадь Спорта', 'Любительский', 250000, 'registration', 'Nike', '/uploads/sponsors/nike.jpg', 'Спортивные товары', NOW(), NOW()),
('Молодежный Кубок', '2025-07-05 11:00:00', 'Казань, Баскет-Холл', 'Юниоры', 150000, 'registration', 'Under Armour', '/uploads/sponsors/underarmour.jpg', 'Спортивные товары', NOW(), NOW()),
('Стритбол Фест 2025', '2025-08-20 14:00:00', 'Москва, Парк Горького', 'Открытый', 300000, 'registration', 'Спортмастер', '/uploads/sponsors/sportmaster.jpg', 'Спортивные товары', NOW(), NOW()),
('Чемпионат города', '2025-09-12 10:00:00', 'Екатеринбург, ДИВс', 'Полупрофессиональный', 500000, 'registration', 'Adidas', '/uploads/sponsors/adidas.jpg', 'Спортивные товары', NOW(), NOW()),
('Зимний турнир', '2025-12-05 15:00:00', 'Москва, ЦСКА Арена', 'Профессиональный', 800000, 'registration', 'Nike', '/uploads/sponsors/nike.jpg', 'Спортивные товары', NOW(), NOW()),
('Женская лига 2025', '2025-10-18 12:00:00', 'Санкт-Петербург, Арена', 'Профессиональный', 600000, 'registration','Under Armour', '/uploads/sponsors/underarmour.jpg', 'Спортивные товары', NOW(), NOW());

-- Заполнение таблицы регистраций
INSERT INTO registrations (team_name, tournament_id, user_id, status, created_at, updated_at) VALUES
('Тигры', 1, 2, 'approved', NOW(), NOW()),
('Метеор', 1, 7, 'approved', NOW(), NOW()),
('Вихрь', 1, 8, 'pending', NOW(), NOW()),
('Комета', 7, 9, 'approved', NOW(), NOW()),
('Искра', 7, 10, 'approved', NOW(), NOW()),
('Львы', 2, 3, 'approved', NOW(), NOW()),
('Ястребы', 2, 4, 'pending', NOW(), NOW()),
('Медведи', 3, 5, 'approved', NOW(), NOW()),
('Орлы', 3, 6, 'approved', NOW(), NOW()),
('Волки', 4, 2, 'approved', NOW(), NOW()),
('Пантеры', 5, 3, 'pending', NOW(), NOW()),
('Драконы', 6, 6, 'approved', NOW(), NOW()),
('Акулы', 6, 8, 'approved', NOW(), NOW());

-- Связь игроков с командами
INSERT INTO player_team (registration_id, user_id) VALUES
-- Команда 'Тигры'
(1, 2), -- Тигры: Тимур (капитан)
(1, 3), -- Тигры: Иван
(1, 4), -- Тигры: Алексей
(1, 5), -- Тигры: Михаил
-- Команда 'Метеор'
(2, 7), -- Метеор: Дмитрий (капитан)
(2, 3), -- Метеор: Иван
(2, 6), -- Метеор: Сергей
-- Команда 'Вихрь'
(3, 8), -- Вихрь: Николай (капитан)
(3, 4), -- Вихрь: Алексей
(3, 5), -- Вихрь: Михаил
-- Команда 'Комета'
(4, 9), -- Комета: Анна (капитан)
(4, 10), -- Комета: Елена
-- Команда 'Искра'
(5, 10), -- Искра: Елена (капитан)
(5, 9), -- Искра: Анна
-- Команда 'Львы'
(6, 3), -- Львы: Иван (капитан)
(6, 2), -- Львы: Тимур
(6, 7), -- Львы: Дмитрий
-- Команда 'Ястребы'
(7, 4), -- Ястребы: Алексей (капитан)
(7, 6), -- Ястребы: Сергей
(7, 8), -- Ястребы: Николай
-- Команда 'Медведи'
(8, 5), -- Медведи: Михаил (капитан)
(8, 2), -- Медведи: Тимур
(8, 6), -- Медведи: Сергей
-- Команда 'Орлы'
(9, 6), -- Орлы: Сергей (капитан)
(9, 7), -- Орлы: Дмитрий
(9, 8), -- Орлы: Николай
-- Команда 'Волки'
(10, 2), -- Волки: Тимур (капитан)
(10, 7), -- Волки: Дмитрий
(10, 8), -- Волки: Николай
-- Команда 'Пантеры'
(11, 3), -- Пантеры: Иван (капитан)
(11, 4), -- Пантеры: Алексей
(11, 5), -- Пантеры: Михаил
-- Команда 'Драконы'
(12, 6), -- Драконы: Сергей (капитан)
(12, 2), -- Драконы: Тимур
(12, 4), -- Драконы: Алексей
-- Команда 'Акулы'
(13, 8), -- Акулы: Николай (капитан)
(13, 5), -- Акулы: Михаил
(13, 7); -- Акулы: Дмитрий

-- Заполнение таблицы рекламы
INSERT INTO ads (title, image_url, tournament_id, advertiser_id, business_id, created_at, updated_at) VALUES
('Новая коллекция баскетбольной обуви Adidas', '/uploads/ads/adidas-shoes.jpg', 1, 15, 11, NOW(), NOW()),
('Nike Air Jordan - выбор чемпионов', '/uploads/ads/nike-jordan.jpg', 2, 15, 12, NOW(), NOW()),
('Under Armour: экипировка для победителей', '/uploads/ads/underarmour-equipment.jpg', 3, 16, 13, NOW(), NOW()),
('Всё для баскетбола в Спортмастере', '/uploads/ads/sportmaster-basketball.jpg', 4, 16, 14, NOW(), NOW()),
('Adidas - официальный спонсор турнира', '/uploads/ads/adidas-sponsor.jpg', 1, 15, 11, NOW(), NOW()),
('Nike представляет новую форму', '/uploads/ads/nike-uniform.jpg', 7, 15, 12, NOW(), NOW());

-- Заполнение таблицы результатов рекламы
INSERT INTO ad_results (ad_id, clicks, views, created_at, updated_at) VALUES
(1, 240, 1500, NOW(), NOW()),
(2, 180, 1200, NOW(), NOW()),
(3, 120, 900, NOW(), NOW()),
(4, 90, 750, NOW(), NOW()),
(5, 210, 1400, NOW(), NOW()),
(6, 150, 1000, NOW(), NOW()); 