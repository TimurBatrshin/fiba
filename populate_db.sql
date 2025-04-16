-- Очистка таблиц перед заполнением (опционально)
DELETE FROM ad_results;
DELETE FROM ads;
DELETE FROM player_team;
DELETE FROM registrations;
DELETE FROM tournaments;
DELETE FROM profiles;
DELETE FROM users;

-- Заполнение таблицы users
INSERT INTO users (name, email, password, email_verified, role, created_at, updated_at)
VALUES 
('Администратор', 'admin@fiba.com', '$2a$10$vYQEr0z7BxlBEVxHZ723nOQGmjC2bv0T1U0DQ26xm8QpIXz4nd9Oe', true, 'admin', now(), now()),
('Иван Петров', 'ivan@example.com', '$2a$10$vYQEr0z7BxlBEVxHZ723nOQGmjC2bv0T1U0DQ26xm8QpIXz4nd9Oe', true, 'user', now(), now()),
('Александр Смирнов', 'alex@example.com', '$2a$10$vYQEr0z7BxlBEVxHZ723nOQGmjC2bv0T1U0DQ26xm8QpIXz4nd9Oe', true, 'user', now(), now()),
('Мария Иванова', 'maria@example.com', '$2a$10$vYQEr0z7BxlBEVxHZ723nOQGmjC2bv0T1U0DQ26xm8QpIXz4nd9Oe', true, 'user', now(), now()),
('Елена Сидорова', 'elena@example.com', '$2a$10$vYQEr0z7BxlBEVxHZ723nOQGmjC2bv0T1U0DQ26xm8QpIXz4nd9Oe', true, 'user', now(), now()),
('Дмитрий Козлов', 'dmitriy@example.com', '$2a$10$vYQEr0z7BxlBEVxHZ723nOQGmjC2bv0T1U0DQ26xm8QpIXz4nd9Oe', true, 'user', now(), now()),
('Анна Новикова', 'anna@example.com', '$2a$10$vYQEr0z7BxlBEVxHZ723nOQGmjC2bv0T1U0DQ26xm8QpIXz4nd9Oe', true, 'user', now(), now()),
('Сергей Морозов', 'sergey@example.com', '$2a$10$vYQEr0z7BxlBEVxHZ723nOQGmjC2bv0T1U0DQ26xm8QpIXz4nd9Oe', true, 'user', now(), now()),
('Ольга Волкова', 'olga@example.com', '$2a$10$vYQEr0z7BxlBEVxHZ723nOQGmjC2bv0T1U0DQ26xm8QpIXz4nd9Oe', true, 'user', now(), now()),
('Максим Лебедев', 'maxim@example.com', '$2a$10$vYQEr0z7BxlBEVxHZ723nOQGmjC2bv0T1U0DQ26xm8QpIXz4nd9Oe', true, 'user', now(), now()),
('Nike', 'nike@example.com', '$2a$10$vYQEr0z7BxlBEVxHZ723nOQGmjC2bv0T1U0DQ26xm8QpIXz4nd9Oe', true, 'advertiser', now(), now()),
('Adidas', 'adidas@example.com', '$2a$10$vYQEr0z7BxlBEVxHZ723nOQGmjC2bv0T1U0DQ26xm8QpIXz4nd9Oe', true, 'advertiser', now(), now());

-- Заполнение таблицы profiles
INSERT INTO profiles (user_id, photo_url, avatar_url, bio, phone_number, city, age, tournaments_played, total_points, rating, created_at, updated_at)
VALUES 
(1, 'https://example.com/photos/admin.jpg', 'https://example.com/avatars/admin.jpg', 'Администратор системы', '+79001234567', 'Москва', 30, 0, 0, 0, now(), now()),
(2, 'https://example.com/photos/ivan.jpg', 'https://example.com/avatars/ivan.jpg', 'Профессиональный игрок в стритбол с 5-летним опытом', '+79001234568', 'Москва', 25, 10, 230, 85, now(), now()),
(3, 'https://example.com/photos/alex.jpg', 'https://example.com/avatars/alex.jpg', 'Любитель стритбола, играю в свободное время', '+79001234569', 'Санкт-Петербург', 28, 5, 120, 65, now(), now()),
(4, 'https://example.com/photos/maria.jpg', 'https://example.com/avatars/maria.jpg', 'Капитан женской команды "Молния"', '+79001234570', 'Москва', 24, 8, 190, 78, now(), now()),
(5, 'https://example.com/photos/elena.jpg', 'https://example.com/avatars/elena.jpg', 'Тренер по баскетболу, люблю стритбол', '+79001234571', 'Казань', 32, 7, 165, 75, now(), now()),
(6, 'https://example.com/photos/dmitriy.jpg', 'https://example.com/avatars/dmitriy.jpg', 'Игрок команды "Драйв", специализируюсь на трехочковых', '+79001234572', 'Москва', 23, 12, 280, 88, now(), now()),
(7, 'https://example.com/photos/anna.jpg', 'https://example.com/avatars/anna.jpg', 'Начинающий игрок, учусь у профессионалов', '+79001234573', 'Екатеринбург', 22, 3, 70, 45, now(), now()),
(8, 'https://example.com/photos/sergey.jpg', 'https://example.com/avatars/sergey.jpg', 'MVP турнира "Стритбаскет 2022"', '+79001234574', 'Новосибирск', 30, 15, 320, 92, now(), now()),
(9, 'https://example.com/photos/olga.jpg', 'https://example.com/avatars/olga.jpg', 'Игрок женской сборной по стритболу', '+79001234575', 'Москва', 26, 9, 205, 80, now(), now()),
(10, 'https://example.com/photos/maxim.jpg', 'https://example.com/avatars/maxim.jpg', 'Защитник команды "Торнадо"', '+79001234576', 'Санкт-Петербург', 27, 11, 260, 86, now(), now()),
(11, NULL, 'https://example.com/avatars/nike.jpg', 'Официальный представитель Nike в России', '+79001234577', 'Москва', NULL, 0, 0, 0, now(), now()),
(12, NULL, 'https://example.com/avatars/adidas.jpg', 'Официальный представитель Adidas в России', '+79001234578', 'Москва', NULL, 0, 0, 0, now(), now());

-- Заполнение таблицы tournaments
INSERT INTO tournaments (title, date, location, level, prize_pool, status, created_at, updated_at)
VALUES 
('Весенний турнир 2024', '2024-05-25 10:00:00', 'Москва, Парк Сокольники', 'professional', 50000, 'registration', now(), now()),
('Летний кубок', '2024-07-15 12:00:00', 'Санкт-Петербург, Спортивная площадка "Юность"', 'amateur', 30000, 'registration', now(), now()),
('Осенний чемпионат', '2024-09-10 11:00:00', 'Казань, Баскет-холл', 'professional', 70000, 'registration', now(), now()),
('Молодежный турнир', '2024-08-05 10:00:00', 'Екатеринбург, Площадь спорта', 'junior', 20000, 'registration', now(), now()),
('Зимний фестиваль стритбола', '2024-12-15 10:00:00', 'Москва, Крытый комплекс "Арена"', 'amateur', 40000, 'registration', now(), now());

-- Заполнение таблицы registrations
INSERT INTO registrations (team_name, tournament_id, user_id, status, created_at, updated_at)
VALUES 
('Драйв', 1, 2, 'approved', now(), now()),
('Молния', 1, 4, 'approved', now(), now()),
('Торнадо', 1, 10, 'pending', now(), now()),
('Сибирь', 1, 8, 'approved', now(), now()),
('Старт', 2, 3, 'approved', now(), now()),
('Звезда', 2, 5, 'pending', now(), now()),
('Атлетик', 3, 6, 'approved', now(), now()),
('Феникс', 3, 9, 'pending', now(), now()),
('Юниоры', 4, 7, 'approved', now(), now());

-- Заполнение таблицы player_team
INSERT INTO player_team (registration_id, user_id, is_captain)
VALUES 
(1, 2, true),  -- Иван капитан команды Драйв
(1, 3, false), -- Александр в команде Драйв
(1, 6, false), -- Дмитрий в команде Драйв
(2, 4, true),  -- Мария капитан команды Молния
(2, 7, false), -- Анна в команде Молния
(2, 9, false), -- Ольга в команде Молния
(3, 10, true), -- Максим капитан команды Торнадо
(3, 3, false), -- Александр также в команде Торнадо
(3, 8, false), -- Сергей в команде Торнадо
(4, 8, true),  -- Сергей капитан команды Сибирь
(4, 5, false), -- Елена в команде Сибирь
(4, 6, false), -- Дмитрий также в команде Сибирь
(5, 3, true),  -- Александр капитан команды Старт
(5, 7, false), -- Анна в команде Старт
(5, 10, false), -- Максим также в команде Старт
(6, 5, true),  -- Елена капитан команды Звезда
(6, 4, false), -- Мария также в команде Звезда
(6, 9, false), -- Ольга также в команде Звезда
(7, 6, true),  -- Дмитрий капитан команды Атлетик
(7, 2, false), -- Иван также в команде Атлетик
(7, 8, false), -- Сергей также в команде Атлетик
(8, 9, true),  -- Ольга капитан команды Феникс
(8, 4, false), -- Мария также в команде Феникс
(8, 7, false), -- Анна также в команде Феникс
(9, 7, true),  -- Анна капитан команды Юниоры
(9, 5, false), -- Елена также в команде Юниоры
(9, 3, false); -- Александр также в команде Юниоры

-- Заполнение таблицы ads
INSERT INTO ads (title, image_url, tournament_id, advertiser_id, business_id, created_at, updated_at)
VALUES 
('Nike Basketball - Новая коллекция', 'https://example.com/ads/nike_collection.jpg', 1, 11, NULL, now(), now()),
('Adidas Street - Обувь для стритбола', 'https://example.com/ads/adidas_shoes.jpg', 1, 12, NULL, now(), now()),
('Nike Jordan - Легендарная серия', 'https://example.com/ads/nike_jordan.jpg', 2, 11, NULL, now(), now()),
('Adidas - Экипировка для профессионалов', 'https://example.com/ads/adidas_equipment.jpg', 3, 12, NULL, now(), now()),
('Nike - Спонсор турнира', 'https://example.com/ads/nike_sponsor.jpg', 4, 11, NULL, now(), now());

-- Заполнение таблицы ad_results
INSERT INTO ad_results (ad_id, clicks, views, created_at, updated_at)
VALUES 
(1, 150, 1500, now(), now()),
(2, 120, 1200, now(), now()),
(3, 200, 2000, now(), now()),
(4, 180, 1800, now(), now()),
(5, 100, 1000, now(), now()); 