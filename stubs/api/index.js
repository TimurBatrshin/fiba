const { Sequelize, DataTypes } = require("sequelize");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const authMiddleware = require("./authMiddleware");
const businessMiddleware = require("./businessMiddleware");
const advertiserMiddleware = require("./advertiserMiddleware");

const app = express();
app.use(cors());
app.use(express.json());

const port = 8080;

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
  role: { type: DataTypes.STRING, defaultValue: 'user' }
}, {
  timestamps: true,
});

const Profile = sequelize.define("Profile", {
  user_id: { type: DataTypes.INTEGER, allowNull: false },  // Добавлено
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

const Registration = sequelize.define("Registration", {
  team_name: { type: DataTypes.STRING, allowNull: false },
  players: { type: DataTypes.JSON, allowNull: false },
}, {
  timestamps: false,
});

// Модель для рекламы
const Ad = sequelize.define("Ad", {
  title: { type: DataTypes.STRING, allowNull: false },
  image_url: { type: DataTypes.STRING, allowNull: false },
  tournament_id: { 
    type: DataTypes.INTEGER,
    references: { model: Tournament, key: "id" }  // Исправлено
  },
  advertiserId: { 
    type: DataTypes.INTEGER, 
    references: { model: User, key: "id" }  // Исправлено
  },
  businessId: { 
    type: DataTypes.INTEGER, 
    references: { model: User, key: "id" }  // Исправлено
  }
}, {
  timestamps: true,
});

// Связи
User.hasOne(Profile, { foreignKey: "user_id" });  
Profile.belongsTo(User, { foreignKey: "user_id" }); 
Tournament.hasMany(Registration, { foreignKey: "tournament_id" });
Registration.belongsTo(Tournament, { foreignKey: "tournament_id" });
Tournament.hasMany(Ad, { foreignKey: "tournament_id" });
Ad.belongsTo(Tournament, { foreignKey: "tournament_id" });
User.hasMany(Ad, { foreignKey: "advertiserId" }); // связь с рекламодателем
User.hasMany(Ad, { foreignKey: "businessId" }); // связь с бизнесом

// Middleware
app.use(cors());
app.use(express.json());

// Настройка отправки email с подтверждением
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'batrshintimur.batrshin@gmail.com',
    pass: 'ygvp rbli wchm qfkn',
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

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await User.create({ name, email, password: hashedPassword });
    await Profile.create({ user_id: newUser.id });

    const token = jwt.sign({ userId: user.id }, 'Timur007', { expiresIn: '1d' });

    const mailOptions = {
      to: email,
      subject: 'Подтверждение email для регистрации',
      html: `<p>Чтобы подтвердить свой email, нажмите <a href="http://localhost:6000/api/auth/verify-email?token=${token}">здесь</a>.</p>`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email отправлен, пожалуйста, подтвердите ваш email.' });
  } catch (error) {
    console.error("Ошибка при регистрации", error); // Логирование ошибки
    res.status(500).send("Ошибка сервера");
  }
});

// Проверка авторизации
app.get("/api/auth/check", authMiddleware, (req, res) => {
  res.status(200).send('Авторизация успешна');
});

// Проверка прав бизнеса
app.get("/api/auth/business-check", authMiddleware, businessMiddleware, (req, res) => {
  res.status(200).send('Авторизация бизнеса успешна');
});

// Подтверждение email
app.get("/api/auth/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, 'Timur007');
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
  
    if (!email || !password) {
      return res.status(400).send("Все поля обязательны для заполнения.");
    }
  
    try {
      const user = await User.findOne({ where: { email } });
  
      if (!user) {
        return res.status(400).json({ message: 'Неверный email или пароль' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Неверный email или пароль' });
      }
  
      const token = jwt.sign({ userId: user.id }, 'Timur007', { expiresIn: '1d' });
  
      res.status(200).json({ token });
    } catch (error) {
      console.error("Ошибка при авторизации", error);
      res.status(500).send("Ошибка сервера");
    }
  });
  
  // Получение профиля пользователя
  app.get("/api/profile", authMiddleware, async (req, res) => {
    try {
      const profile = await Profile.findOne({ where: { user_id: req.user.userId }, include: [User] });
      if (!profile) {
        return res.status(404).send("Профиль не найден");
      }
      res.status(200).json(profile);
    } catch (error) {
      console.error("Ошибка при получении профиля:", error);
      res.status(500).send("Ошибка при получении профиля");
    }
  });
  
  // Обновление профиля пользователя
  app.put("/api/profile", authMiddleware, async (req, res) => {
    const { photo_url, tournaments_played, total_points, rating } = req.body;
    try {
      const profile = await Profile.findOne({ where: { user_id: req.user.userId } });
      if (!profile) {
        return res.status(404).send("Профиль не найден");
      }
      profile.photo_url = photo_url || profile.photo_url;
      profile.tournaments_played = tournaments_played || profile.tournaments_played;
      profile.total_points = total_points || profile.total_points;
      profile.rating = rating || profile.rating;
      await profile.save();
      res.status(200).json(profile);
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
      res.status(500).send("Ошибка при обновлении профиля");
    }
  });

/// Создание турнира
app.post("/api/tournaments", async (req, res) => {
    const { title, date, location, level, prize_pool, rules } = req.body;
  
    try {
      const tournament = await Tournament.create({
        title,
        date,
        location,
        level,
        prize_pool,
        rules,
        status: 'registration',
      });
      res.status(201).json(tournament);
    } catch (error) {
      console.error('Error creating tournament:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Создание турнира (доступно только для бизнес-аккаунтов)
app.post("/api/tournaments/business", authMiddleware, businessMiddleware, async (req, res) => {
  const { title, date, location, level, prize_pool, rules } = req.body;

  try {
    // Здесь можно также добавить businessId, если требуется связывать турнир с конкретным бизнес-аккаунтом:
    const tournament = await Tournament.create({
      title,
      date,
      location,
      level,
      prize_pool,
      rules,
      status: 'registration',
      businessId: req.user.id  // req.user установлено в authMiddleware
    });
    res.status(201).json(tournament);
  } catch (error) {
    console.error('Ошибка при создании турнира:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Редактирование турнира
app.put("/api/tournaments/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, date, location, level, prize_pool, status } = req.body;

  try {
    const tournament = await Tournament.findByPk(id);
    if (!tournament) {
      return res.status(404).send("Турнир не найден");
    }

    tournament.title = title || tournament.title;
    tournament.date = date || tournament.date;
    tournament.location = location || tournament.location;
    tournament.level = level || tournament.level;
    tournament.prize_pool = prize_pool || tournament.prize_pool;
    tournament.status = status || tournament.status;
    await tournament.save();

    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).send("Ошибка при редактировании турнира");
  }
});

// Удаление турнира
app.delete("/api/tournaments/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const tournament = await Tournament.findByPk(id);
    if (!tournament) {
      return res.status(404).send("Турнир не найден");
    }

    await tournament.destroy();
    res.status(200).send("Турнир успешно удален");
  } catch (error) {
    res.status(500).send("Ошибка при удалении турнира");
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
app.get('/api/tournaments', async (req, res) => {
  const { date, location, level } = req.query;
  
  const query = {};
  if (date) query.date = date;
  if (location) query.location = location;
  if (level) query.level = level;

  try {
    const tournaments = await Tournament.find(query);
    res.json(tournaments);
  } catch (error) {
    res.status(500).send("Ошибка при получении турниров.");
  }
});


app.get("/user/:userId/registrations", async (req, res) => {
  const { userId } = req.params;

  try {
    const registrations = await Registration.findAll({
      where: { user_id: userId },
      include: [{ model: Tournament }],
    });

    const tournaments = registrations.map((reg) => reg.Tournament);
    res.json(tournaments);
  } catch (error) {
    console.error("Ошибка при получении турниров:", error);
    res.status(500).json({ message: "Ошибка сервера" });
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

// Получение информации о турнире и его участниках
app.get("/api/tournaments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const tournament = await Tournament.findByPk(id, {
      include: [Registration]
    });
    if (!tournament) {
      return res.status(404).send("Турнир не найден");
    }
    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).send("Ошибка при получении информации о турнире");
  }
});

app.post("/api/ads/propose", authMiddleware, advertiserMiddleware, async (req, res) => {
  const { title, image_url, tournament_id, adContent } = req.body;
  // Если в модели Ad уже используются поля title и image_url, можно их переиспользовать, либо добавить adContent отдельно.
  try {
    const ad = await Ad.create({
      title, 
      image_url,
      tournament_id,
      advertiserId: req.user.id  // Рекламный аккаунт
      // businessId можно добавить, если требуется, но в данном случае мы сосредоточимся на рекламном аккаунте.
    });
    res.status(201).json(ad);
  } catch (error) {
    console.error('Ошибка при предложении рекламы:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Создание рекламы
app.post("/api/ads", authMiddleware, async (req, res) => {
  const { title, image_url, tournament_id } = req.body;

  if (!title || !image_url || !tournament_id) {
    return res.status(400).send("Все поля обязательны для заполнения.");
  }

  try {
    const newAd = await Ad.create({ title, image_url, tournament_id });
    res.status(201).json(newAd);
  } catch (error) {
    res.status(500).send("Ошибка при создании рекламы");
  }
});

// Редактирование рекламы
app.put("/api/ads/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, image_url, tournament_id } = req.body;

  try {
    const ad = await Ad.findByPk(id);
    if (!ad) {
      return res.status(404).send("Реклама не найдена");
    }

    ad.title = title || ad.title;
    ad.image_url = image_url || ad.image_url;
    ad.tournament_id = tournament_id || ad.tournament_id;
    await ad.save();

    res.status(200).json(ad);
  } catch (error) {
    res.status(500).send("Ошибка при редактировании рекламы");
  }
});

// Удаление рекламы
app.delete("/api/ads/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const ad = await Ad.findByPk(id);
    if (!ad) {
      return res.status(404).send("Реклама не найдена");
    }

    await ad.destroy();
    res.status(200).send("Реклама успешно удалена");
  } catch (error) {
    res.status(500).send("Ошибка при удалении рекламы");
  }
});

// Новый маршрут для получения роли пользователя
app.get("/api/user/role", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.status(200).json({ role: user.role });
  } catch (error) {
    console.error("Ошибка при получении роли пользователя", error);
    res.status(500).send("Ошибка сервера");
  }
});

// Предложение рекламы рекламным аккаунтом
app.post("/api/ads", advertiserMiddleware, async (req, res) => {
  const { title, image_url, tournament_id } = req.body;

  try {
    const ad = await Ad.create({
      title,
      image_url,
      tournament_id,
      advertiserId: req.userId, // ID пользователя, который сделал предложение
    });
    res.status(201).json(ad);
  } catch (error) {
    console.error('Ошибка при создании рекламы', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

portfinder.getPortPromise({ port: port, stopPort: 8080 }).then((port) => {
    app.listen(port, async () => {
      try {
        await sequelize.sync();  // Синхронизация с БД
        console.log('Синхронизация с БД прошла успешна');
        console.log(`Server is running on http://localhost:${port}`);
      } catch (error) {
        console.error("Ошибка подключения к базе данных", error);
      }
    });
  }).catch((err) => {
    console.error(`Не удалось найти свободный порт: ${err.message}`);
  });