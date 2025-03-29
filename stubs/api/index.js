const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
const port = 5000;

// Создание подключения к базе данных через Sequelize
const sequelize = new Sequelize("streetball", "postgres", "qwerty123", {
  host: "localhost",
  dialect: "postgres",
  logging: true,
});

// Определение моделей
const User = sequelize.define("User", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,
});

const Profile = sequelize.define("Profile", {
  photo_url: DataTypes.STRING,
  tournaments_played: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_points: { type: DataTypes.INTEGER, defaultValue: 0 },
  rating: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  timestamps: true,
});

const Tournament = sequelize.define("Tournament", {
  title: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  level: { type: DataTypes.STRING, allowNull: false },
  prize_pool: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "registration" },
}, {
  timestamps: false,
});

// Модель для регистрации
const Registration = sequelize.define("Registration", {
  team_name: { type: DataTypes.STRING, allowNull: false },
  players: { type: DataTypes.JSON, allowNull: false },
}, {
  timestamps: false,
});

// Связи
User.hasOne(Profile, { foreignKey: "user_id" });
Profile.belongsTo(User, { foreignKey: "user_id" });
Tournament.hasMany(Registration, { foreignKey: "tournament_id" });
Registration.belongsTo(Tournament, { foreignKey: "tournament_id" });

// Middleware
app.use(cors());
app.use(express.json());

// Настройка отправки email с подтверждением
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password',
  },
});

// Регистрация пользователя
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("Все поля обязательны для заполнения.");
  }

  const userExist = await User.findOne({ where: { email } });
  if (userExist) {
    return res.status(400).send('Email уже зарегистрирован');
  }

  // Хэшируем пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await User.create({ name, email, password: hashedPassword });

    // Создаем профиль пользователя
    await Profile.create({ user_id: newUser.id });

    // Генерация токена для подтверждения email
    const token = jwt.sign({ userId: newUser.id }, 'SECRET_KEY', { expiresIn: '1h' });

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

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.email_verified = true;
    await user.save();

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
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

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

    const profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      return res.status(404).json({ message: "Профиль не найден" });
    }

    res.status(200).json(profile);
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

    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (!profile) {
      return res.status(404).json({ message: "Профиль не найден" });
    }

    profile.photo_url = photo_url;
    profile.tournaments_played = tournaments_played;
    profile.total_points = total_points;
    profile.rating = rating;
    await profile.save();

    res.status(200).json(profile);
  } catch (error) {
    console.error("Ошибка при обновлении профиля", error);
    res.status(500).send("Ошибка сервера");
  }
});

// Получение турниров
app.get("/api/tournaments", async (req, res) => {
  try {
    const tournaments = await Tournament.findAll({ order: [['date', 'ASC']] });
    res.json(tournaments);
  } catch (error) {
    console.error("Ошибка при получении турниров", error);
    res.status(500).send("Ошибка сервера");
  }
});

// Создание турнира
app.post("/api/tournaments", async (req, res) => {
  const { title, date, location, level, prize_pool } = req.body;

  if (!title || !date || !location || !level || !prize_pool) {
    return res.status(400).send("Все поля обязательны для заполнения.");
  }

  try {
    const newTournament = await Tournament.create({ title, date, location, level, prize_pool });
    res.json(newTournament);
  } catch (error) {
    console.error("Ошибка при создании турнира", error);
    res.status(500).send("Ошибка сервера");
  }
});

// Регистрация турнира
app.post("/api/admin/tournaments", async (req, res) => {
  const { title, date, location, level, prize_pool } = req.body;

  if (!title || !date || !location || !level || !prize_pool) {
    return res.status(400).send("Все поля обязательны для заполнения.");
  }

  try {
    const newTournament = await Tournament.create({ title, date, location, level, prize_pool });
    res.json(newTournament);
  } catch (error) {
    console.error("Ошибка при создании турнира", error);
    res.status(500).send("Ошибка сервера");
  }
});

// Получение турниров с фильтрами
app.get("/api/tournaments", async (req, res) => {
  const { date, location, level } = req.query;
  const filters = {};

  if (date) {
    filters.date = date;
  }

  if (location) {
    filters.location = { [Sequelize.Op.iLike]: `%${location}%` };
  }

  if (level) {
    filters.level = level;
  }

  try {
    const tournaments = await Tournament.findAll({
      where: filters,
      order: [['date', 'ASC']],
    });
    res.json(tournaments);
  } catch (error) {
    console.error("Ошибка при получении турниров", error);
    res.status(500).send("Ошибка сервера");
  }
});

// Регистрация на турнир
app.post("/api/tournaments/:id/register", async (req, res) => {
  const { id } = req.params;
  const { teamName, players } = req.body;

  if (!teamName || !players || players.length !== 4) {
    return res.status(400).send("Команда должна состоять из 4 игроков (3 игрока и 1 запасной).");
  }

  try {
    const registration = await Registration.create({
      tournament_id: id,
      team_name: teamName,
      players: JSON.stringify(players),
    });
    res.json(registration);
  } catch (error) {
    console.error("Ошибка при регистрации на турнир", error);
    res.status(500).send("Ошибка сервера");
  }
});

// Получение информации о турнире по ID
app.get("/api/tournament/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const tournament = await Tournament.findByPk(id);

    if (!tournament) {
      return res.status(404).json({ message: "Турнир не найден" });
    }

    res.json(tournament);
  } catch (error) {
    console.error("Ошибка при получении турнира", error);
    res.status(500).send("Ошибка сервера");
  }
});

// Запуск сервера
app.listen(port, async () => {
  try {
    await sequelize.sync();  // Синхронизация с БД
    console.log('Синхронизация с БД прошла успешна');
    console.log(`Server is running on http://localhost:${port}`);
  } catch (error) {
    console.error("Ошибка подключения к базе данных", error);
  }
});
