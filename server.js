const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bodyParser = require("body-parser");

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

// Используем middlewares
app.use(cors());
app.use(bodyParser.json());

// API для получения турниров
app.get("/api/tournaments", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tournaments ORDER BY date ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка при получении турниров", error);
    res.status(500).send("Ошибка сервера");
  }
});

// API для создания турнира
app.post("/api/tournaments", async (req, res) => {
  const { name, date, location } = req.body;

  if (!name || !date || !location) {
    return res.status(400).send("Все поля обязательны для заполнения.");
  }

  try {
    const result = await pool.query(
      "INSERT INTO tournaments (name, date, location) VALUES ($1, $2, $3) RETURNING *",
      [name, date, location]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка при создании турнира", error);
    res.status(500).send("Ошибка сервера");
  }
});
// API для получения информации о турнире по ID
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

// API для получения информации о турнире по ID
app.get("/api/tournament/:id", async (req, res) => {
    const { id } = req.params;
  console.log(id);
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

// API для получения рекламы
app.get("/api/ads", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ads ORDER BY status ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка при получении рекламы", error);
    res.status(500).send("Ошибка сервера");
  }
});

// API для добавления рекламы
app.post("/api/ads", async (req, res) => {
  const { title, status } = req.body;

  if (!title || !status) {
    return res.status(400).send("Все поля обязательны для заполнения.");
  }

  try {
    const result = await pool.query(
      "INSERT INTO ads (title, status) VALUES ($1, $2) RETURNING *",
      [title, status]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка при добавлении рекламы", error);
    res.status(500).send("Ошибка сервера");
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
