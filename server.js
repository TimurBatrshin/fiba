const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const app = express();
const port = 5000;

// Создание подключения к базе данных PostgreSQL
const pool = new Pool({
  user: "postgres", // Замените на вашего пользователя PostgreSQL
  host: "localhost",
  database: "streetball", // Замените на имя вашей базы данных
  password: "qwerty123", // Замените на ваш пароль
  port: 5432,
});

// Настройка отправки email с подтверждением
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

// Используем middlewares
app.use(cors());
app.use(bodyParser.json());

// Регистрация пользователя
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("Все поля обязательны для заполнения.");
  }

  // Хэшируем пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Добавляем нового пользователя в базу
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );

    // Генерация токена для подтверждения email
    const token = jwt.sign({ userId: newUser.rows[0].id }, 'SECRET_KEY', { expiresIn: '1h' });

    // Отправка email с ссылкой для подтверждения
    const mailOptions = {
      to: email,
      subject: 'Подтверждение email для регистрации',
      html: `<p>Чтобы подтвердить свой email, нажмите <a href="http://localhost:3000/verify-email?token=${token}">здесь</a>.</p>`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email отправлен, пожалуйста, подтвердите ваш email.' });

  } catch (error) {
    console.error("Ошибка при регистрации", error);
    res.status(500).send("Ошибка сервера");
  }
});

// Подтверждение email
app.get("/api/auth/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, 'SECRET_KEY');
    const userId = decoded.userId;

    // Обновляем статус подтверждения email
    await pool.query('UPDATE users SET email_verified = TRUE WHERE id = $1', [userId]);

    res.status(200).json({ message: 'Email подтвержден успешно!' });
  } catch (error) {
    console.error("Ошибка при подтверждении email", error);
    res.status(400).json({ message: 'Невалидная ссылка для подтверждения email.' });
  }
});

// Авторизация
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    // Сравниваем пароли
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    // Генерация JWT токена
    const token = jwt.sign({ userId: user.id }, 'SECRET_KEY', { expiresIn: '1d' });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Ошибка при авторизации", error);
    res.status(500).send("Ошибка сервера");
  }
});

// Получение профиля пользователя
app.get("/api/profile", async (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).send("Требуется авторизация");
  }

  try {
    const decoded = jwt.verify(token, 'SECRET_KEY');
    const userId = decoded.userId;

    // Получаем профиль пользователя
    const profile = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);

    if (profile.rows.length === 0) {
      return res.status(404).json({ message: "Профиль не найден" });
    }

    res.status(200).json(profile.rows[0]);
  } catch (error) {
    console.error("Ошибка при получении профиля", error);
    res.status(500).send("Ошибка сервера");
  }
});

// Обновление профиля пользователя
app.put("/api/profile", async (req, res) => {
  const { photo_url, tournaments_played, total_points, rating } = req.body;
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).send("Требуется авторизация");
  }

  try {
    const decoded = jwt.verify(token, 'SECRET_KEY');
    const userId = decoded.userId;

    // Обновляем профиль пользователя
    const updatedProfile = await pool.query(
      'UPDATE profiles SET photo_url = $1, tournaments_played = $2, total_points = $3, rating = $4 WHERE user_id = $5 RETURNING *',
      [photo_url, tournaments_played, total_points, rating, userId]
    );

    res.status(200).json(updatedProfile.rows[0]);
  } catch (error) {
    console.error("Ошибка при обновлении профиля", error);
    res.status(500).send("Ошибка сервера");
  }
});

// Получение турниров
app.get("/api/tournaments", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tournaments ORDER BY date ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка при получении турниров", error);
    res.status(500).send("Ошибка сервера");
  }
});

// Создание турнира
app.post("/api/tournaments", async (req, res) => {
  const { name, date, location, level, prize_pool } = req.body;

  if (!name || !date || !location || !level || !prize_pool) {
    return res.status(400).send("Все поля обязательны для заполнения.");
  }

  try {
    const result = await pool.query(
      "INSERT INTO tournaments (name, date, location, level, prize_pool) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, date, location, level, prize_pool]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка при создании турнира", error);
    res.status(500).send("Ошибка сервера");
  }
});

// API для создания турнира администратором
app.post("/api/admin/tournaments", async (req, res) => {
  const { name, date, location, level, prize_pool } = req.body;

  if (!name || !date || !location || !level || !prize_pool) {
    return res.status(400).send("Все поля обязательны для заполнения.");
  }

  try {
    const result = await pool.query(
      "INSERT INTO tournaments (name, date, location, level, prize_pool) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, date, location, level, prize_pool]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка при создании турнира", error);
    res.status(500).send("Ошибка сервера");
  }
});


// API для получения турниров с фильтрами
app.get("/api/tournaments", async (req, res) => {
    const { date, location, level } = req.query;
    let query = "SELECT * FROM tournaments WHERE 1 = 1";
    const params = [];
  
    if (date) {
      query += " AND date = $1";
      params.push(date);
    }
  
    if (location) {
      query += " AND location ILIKE $2";
      params.push(`%${location}%`);
    }
  
    if (level) {
      query += " AND level = $3";
      params.push(level);
    }
  
    query += " ORDER BY date ASC";
  
    try {
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error("Ошибка при получении турниров", error);
      res.status(500).send("Ошибка сервера");
    }
  });

// API для регистрации на турнир
app.post("/api/tournaments/:id/register", async (req, res) => {
    const { id } = req.params;
    const { teamName, players } = req.body;
  
    if (!teamName || !players || players.length !== 4) {
      return res.status(400).send("Команда должна состоять из 4 игроков (3 игрока и 1 запасной).");
    }
  
    try {
      // Добавляем команду в турнир
      const result = await pool.query(
        "INSERT INTO registrations (tournament_id, team_name, players) VALUES ($1, $2, $3) RETURNING *",
        [id, teamName, JSON.stringify(players)]
      );
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Ошибка при регистрации на турнир", error);
      res.status(500).send("Ошибка сервера");
    }
  });

// Получение информации о турнире по ID
app.get("/api/tournament/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM tournaments WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Турнир не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка при получении турнира", error);
    res.status(500).send("Ошибка сервера");
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
