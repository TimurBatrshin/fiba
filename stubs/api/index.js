const { Sequelize, DataTypes } = require("sequelize");
const express = require("express");
const multer = require('multer');
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const authMiddleware = require("./authMiddleware");
const businessMiddleware = require("./businessMiddleware");
const advertiserMiddleware = require("./advertiserMiddleware");
const path = require('path');
const { Op } = require("sequelize");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Папка для загрузок
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

const app = express();
app.use(cors({
  origin: 'http://localhost:8099',
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization',  // Разрешаем нужные заголовки
}));
app.use(express.json());

// const exemptRoutes = ['/login', '/register'];
// const authenticate = (req, res, next) => {

//   if (exemptRoutes.includes(req.path)) {
//     return next();
//   }

//   const token = req.header('Authorization')?.replace('Bearer ', '');
  
//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   try {
//     const decoded = jwt.verify(token, 'Timur007');
//     req.user = decoded; // Attach user info to the request
//     next();
//   } catch (error) {
//     return res.status(401).json({ error: 'Invalid token' });
//   }
// };

// app.use(authenticate);

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
  tournament_id: { 
    type: DataTypes.INTEGER,
    references: { model: Tournament, key: "id" },
    allowNull: false
  },
  user_id: { 
    type: DataTypes.INTEGER,
    references: { model: User, key: "id" },
    allowNull: false  // ID капитана/создателя команды
  },
  status: { type: DataTypes.STRING, defaultValue: 'pending' }
}, {
  timestamps: true,
});

// Создаем промежуточную модель для связи многие-ко-многим между Registration и User
const PlayerTeam = sequelize.define("PlayerTeam", {
  registration_id: {
    type: DataTypes.INTEGER,
    references: { model: Registration, key: "id" },
    primaryKey: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: { model: User, key: "id" },
    primaryKey: true,
    allowNull: false
  },
  is_captain: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  position: { 
    type: DataTypes.STRING, 
    defaultValue: 'player' // 'player', 'reserve'
  }
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

const AdResults = sequelize.define("AdResults", {
  adId: {
    type: DataTypes.INTEGER,
    references: { model: Ad, key: "id" }  // Правильно: ссылка на переменную модели
  },
  clicks: { type: DataTypes.INTEGER, defaultValue: 0 },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
});



// Связи
User.hasOne(Profile, { foreignKey: "user_id" });  
Profile.belongsTo(User, { foreignKey: "user_id" }); 

// Связи для регистрации команд
Tournament.hasMany(Registration, { foreignKey: "tournament_id" });
Registration.belongsTo(Tournament, { foreignKey: "tournament_id" });
User.hasMany(Registration, { foreignKey: "user_id", as: "CaptainedTeams" });
Registration.belongsTo(User, { foreignKey: "user_id", as: "Captain" });

// Связь многие-ко-многим между Registration и User через PlayerTeam
Registration.belongsToMany(User, { through: PlayerTeam, foreignKey: 'registration_id', as: 'Players' });
User.belongsToMany(Registration, { through: PlayerTeam, foreignKey: 'user_id', as: 'Teams' });

// Связи для рекламы
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

app.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);  // Находим пользователя по ID

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Возвращаем данные о пользователе
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,  // Роль пользователя
      // Добавьте другие поля по необходимости
    });

  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить результаты рекламы
app.get('/ad-results', async (req, res) => {
  try {
    const adResults = await AdResults.findAll();
    res.json(adResults);
  } catch (error) {
    console.error("Ошибка при получении результатов рекламы", error);
    res.status(500).json({ error: "Ошибка при получении результатов рекламы" });
  }
});

// Обновить статистику рекламы
app.post('/ad-results/update', async (req, res) => {
  const { adId, clicks, impressions } = req.body;

  try {
    const adResult = await AdResults.findOne({ where: { adId } });

    if (adResult) {
      adResult.clicks += clicks;
      adResult.impressions += impressions;
      await adResult.save();
    } else {
      await AdResults.create({
        adId,
        clicks,
        impressions,
      });
    }

    res.status(200).json({ message: "Результаты обновлены!" });
  } catch (error) {
    console.error("Ошибка при обновлении результатов рекламы", error);
    res.status(500).json({ error: "Ошибка при обновлении результатов рекламы" });
  }
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

    const token = jwt.sign({ userId: newUser.id }, 'Timur007', { expiresIn: '1d' });

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
      const profile = await Profile.findOne({ where: { user_id: 1 }, include: [User] });
      if (!profile) {
        return res.status(404).send("Профиль не найден");
      }
      res.status(200).json(profile);
    } catch (error) {
      console.error("Ошибка при получении профиля:", error);
      res.status(500).send("Ошибка при получении профиля");
    }
  });

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  app.post('/api/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('Фото не загружено');
    }
    res.json({ photo_url: `/uploads/${req.file.filename}` }); // Возвращаем URL для доступа к фото
  });
  
  // Обновление профиля пользователя
  app.put('/api/profile', upload.single('photo'), async (req, res) => {
    const { tournaments_played, total_points, rating, userIdBody } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;
  
    const updatedProfile = await Profile.update(
      {
        photo_url: photo || existingProfile.photo_url,
        tournaments_played,
        total_points,
        rating,
      },
      { where: { user_id: 1 } }
    );
  
    res.json(updatedProfile);
  });

// Создание турнира (доступно только для бизнес-аккаунтов)
app.post("/api/tournaments/business", authMiddleware, businessMiddleware, async (req, res) => {
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
      businessId: 1,  // Зависит от authMiddleware
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

  try {
    // Находим все турниры без конкретных условий (findAll с пустым объектом)
    const tournaments = await Tournament.findAll();
    console.log(`Найдено турниров: ${tournaments.length}`);
    
    // Если есть фильтры, применяем их к уже найденным турнирам
    let filteredTournaments = [...tournaments];
    
    if (date) {
      filteredTournaments = filteredTournaments.filter(t => 
        new Date(t.date).toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
      );
    }
    
    if (location) {
      filteredTournaments = filteredTournaments.filter(t => 
        t.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    if (level) {
      filteredTournaments = filteredTournaments.filter(t => 
        t.level.toLowerCase() === level.toLowerCase()
      );
    }
    
    // Если нет данных, создадим несколько тестовых турниров
    if (tournaments.length === 0) {
      console.log("Турниры не найдены, создаю тестовые данные...");
      // Создаем несколько тестовых турниров
      const testTournaments = [
        {
          title: "Турнир по стритболу 3x3",
          date: new Date("2024-07-10"),
          location: "Москва, Парк Горького",
          level: "Профессиональный",
          prize_pool: 100000,
          status: "registration"
        },
        {
          title: "Любительский турнир 3x3",
          date: new Date("2024-07-15"),
          location: "Санкт-Петербург, Площадь Восстания",
          level: "Любительский",
          prize_pool: 50000,
          status: "registration"
        },
        {
          title: "Юниорский турнир по баскетболу",
          date: new Date("2024-07-20"),
          location: "Казань, Центральный стадион",
          level: "Юниорский",
          prize_pool: 30000,
          status: "registration"
        }
      ];
      
      for (const tournament of testTournaments) {
        await Tournament.create(tournament);
      }
      
      // Получаем созданные турниры
      const createdTournaments = await Tournament.findAll();
      return res.json(createdTournaments);
    }
    
    console.log(`Отправляю ${filteredTournaments.length} турниров после фильтрации`);
    res.json(filteredTournaments);
  } catch (error) {
    console.error("Ошибка при получении турниров:", error);
    res.status(500).json({ message: "Ошибка при получении турниров." });
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

// Эндпоинт для получения списка всех пользователей
app.get("/api/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'fullName', 'photoUrl']
    });
    res.json(users);
  } catch (error) {
    console.error("Ошибка при получении списка пользователей:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Эндпоинт для поиска пользователей по части имени или email
app.get("/api/users/search", authMiddleware, async (req, res) => {
  const { query } = req.query;
  
  if (!query || query.length < 2) {
    return res.json([]);
  }
  
  try {
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { fullName: { [Op.like]: `%${query}%` } },
          { username: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } }
        ]
      },
      attributes: ['id', 'username', 'email', 'fullName', 'photoUrl']
    });
    res.json(users);
  } catch (error) {
    console.error("Ошибка при поиске пользователей:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Эндпоинт для получения данных пользователя по ID
app.get("/api/users/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'email', 'fullName', 'photoUrl']
    });
    
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Ошибка при получении данных пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Обновленный эндпоинт для регистрации на турнир
app.post("/api/tournaments/:id/register", authMiddleware, async (req, res) => {
  const tournamentId = req.params.id;
  const { teamName, playerIds } = req.body;
  const userId = req.user.id;

  if (!teamName || !playerIds || playerIds.length < 3) {
    return res.status(400).json({ message: "Необходимо указать название команды и минимум 3 игрока" });
  }

  try {
    // Проверка существования пользователей
    for (const playerId of playerIds) {
      const user = await User.findByPk(playerId);
      if (!user) {
        return res.status(404).json({ message: `Пользователь с ID ${playerId} не найден` });
      }
    }
    
    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Турнир не найден" });
    }

    // Создаем транзакцию для обеспечения целостности данных
    const t = await sequelize.transaction();

    try {
      // 1. Создаем запись о регистрации команды
      const registration = await Registration.create({
        team_name: teamName,
        tournament_id: tournamentId,
        user_id: userId,  // капитан команды
        status: 'pending'
      }, { transaction: t });

      // 2. Добавляем связи игроков с командой
      const playerTeamRecords = [];
      
      // Сначала добавляем капитана (текущий пользователь)
      playerTeamRecords.push({
        registration_id: registration.id,
        user_id: userId,
        is_captain: true,
        position: 'player'
      });
      
      // Затем добавляем остальных игроков
      for (let i = 0; i < playerIds.length; i++) {
        // Пропускаем добавление капитана, если он уже в списке игроков
        if (playerIds[i] == userId) continue;
        
        playerTeamRecords.push({
          registration_id: registration.id,
          user_id: playerIds[i],
          is_captain: false,
          position: i < 3 ? 'player' : 'reserve' // первые 3 игрока - основные, остальные - запасные
        });
      }
      
      // Создаем все записи за один запрос
      await PlayerTeam.bulkCreate(playerTeamRecords, { transaction: t });
      
      // Если всё ок, коммитим транзакцию
      await t.commit();

      // Получаем полные данные о регистрации с игроками для ответа
      const completeRegistration = await Registration.findByPk(registration.id, {
        include: [
          { model: User, as: 'Captain' },
          { model: User, as: 'Players' }
        ]
      });

      console.log(`Команда ${teamName} зарегистрирована на турнир ${tournamentId}`);
      res.status(201).json(completeRegistration);
    } catch (error) {
      // В случае ошибки откатываем все изменения
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Ошибка при регистрации на турнир:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Получение информации о турнире и его участниках
app.get("/api/tournaments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const tournament = await Tournament.findByPk(id, {
      include: [
        {
          model: Registration,
          include: [
            { model: User, as: 'Captain' },
            { model: User, as: 'Players' }
          ]
        }
      ]
    });
    
    if (!tournament) {
      return res.status(404).json({ message: "Турнир не найден" });
    }
    
    res.status(200).json(tournament);
  } catch (error) {
    console.error("Ошибка при получении информации о турнире:", error);
    res.status(500).json({ message: "Ошибка при получении информации о турнире" });
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
    return res.status(400).json({ message: "Все поля обязательны для заполнения." });
  }

  try {
    const newAd = await Ad.create({ title, image_url, tournament_id });
    res.status(201).json(newAd);
  } catch (error) {
    console.error("Ошибка при создании рекламы:", error);
    res.status(500).json({ message: "Ошибка при создании рекламы" });
  }
});

// Редактирование рекламы
app.put("/api/ads/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, image_url, tournament_id } = req.body;

  try {
    const ad = await Ad.findByPk(id);
    if (!ad) {
      return res.status(404).json({ message: "Реклама не найдена" });
    }

    ad.title = title || ad.title;
    ad.image_url = image_url || ad.image_url;
    ad.tournament_id = tournament_id || ad.tournament_id;
    await ad.save();

    res.status(200).json(ad);
  } catch (error) {
    console.error("Ошибка при редактировании рекламы:", error);
    res.status(500).json({ message: "Ошибка при редактировании рекламы" });
  }
});

// Удаление рекламы
app.delete("/api/ads/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const ad = await Ad.findByPk(id);
    if (!ad) {
      return res.status(404).json({ message: "Реклама не найдена" });
    }

    await ad.destroy();
    res.status(200).json({ message: "Реклама успешно удалена" });
  } catch (error) {
    console.error("Ошибка при удалении рекламы:", error);
    res.status(500).json({ message: "Ошибка при удалении рекламы" });
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
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Предложение рекламы рекламным аккаунтом
app.post("/api/ads/propose/business", advertiserMiddleware, async (req, res) => {
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
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Получение рекламы для турнира
app.get("/api/advertisement", async (req, res) => {
  try {
    const ads = await Ad.findAll({
      limit: 1,
      order: [['createdAt', 'DESC']]
    });
    
    if (ads.length > 0) {
      res.json(ads[0]);
    } else {
      // Создаем тестовую рекламу, если нет реальных данных
      const demoAd = {
        id: 'demo-1',
        title: 'Спонсор турнира',
        image_url: '/images/sponsors/sponsor-logo.png',
        text: 'Станьте нашим партнером и получите доступ к активным игрокам стритбола!'
      };
      res.json(demoAd);
    }
  } catch (error) {
    console.error("Ошибка при получении рекламы:", error);
    res.status(500).json({ message: "Ошибка при получении рекламы" });
  }
});

// Получение матчей турнира
app.get("/api/tournaments/:id/matches", async (req, res) => {
  const { id } = req.params;
  
  try {
    // Проверяем существование турнира
    const tournament = await Tournament.findByPk(id);
    if (!tournament) {
      return res.status(404).json({ message: "Турнир не найден" });
    }
    
    // Получаем все регистрации команд
    const registrations = await Registration.findAll({
      where: { tournament_id: id }
    });
    
    // Если нет регистраций или их менее 2, возвращаем пустой массив
    if (registrations.length < 2) {
      return res.json([]);
    }
    
    // Создаем заглушки для матчей на основе регистраций
    const matches = [];
    let matchNumber = 1;
    
    // Создаем команды из регистраций
    const teams = registrations.map(reg => ({
      id: `team-${reg.id}`,
      name: reg.team_name,
      players: reg.players
    }));
    
    // Генерируем пары для первого раунда
    for (let i = 0; i < teams.length; i += 2) {
      if (i + 1 < teams.length) {
        matches.push({
          id: `match-${id}-${matchNumber}`,
          team1: teams[i],
          team2: teams[i + 1],
          score1: Math.floor(Math.random() * 15),
          score2: Math.floor(Math.random() * 15),
          matchTime: new Date(Date.now() + matchNumber * 24 * 60 * 60 * 1000).toISOString(),
          courtNumber: Math.ceil(Math.random() * 3),
          isCompleted: Math.random() > 0.5,
          round: 1,
          matchNumber
        });
        matchNumber++;
      }
    }
    
    res.json(matches);
  } catch (error) {
    console.error("Ошибка при получении матчей турнира:", error);
    res.status(500).json({ message: "Ошибка при получении матчей" });
  }
});

// Обновление результатов матча
app.put("/api/tournaments/:tournamentId/matches/:matchId", authMiddleware, async (req, res) => {
  const { tournamentId, matchId } = req.params;
  const { score1, score2, isCompleted } = req.body;
  
  try {
    // Здесь была бы логика обновления счета матча в реальной базе данных
    // Для демо просто возвращаем обновленный объект
    const updatedMatch = {
      id: matchId,
      score1,
      score2,
      isCompleted,
      updatedAt: new Date().toISOString()
    };
    
    res.json(updatedMatch);
  } catch (error) {
    console.error("Ошибка при обновлении результатов матча:", error);
    res.status(500).json({ message: "Ошибка при обновлении результатов" });
  }
});

// Получение статистики игрока
app.get("/api/players/:playerId/stats", async (req, res) => {
  const { playerId } = req.params;
  
  try {
    const user = await User.findByPk(playerId);
    if (!user) {
      return res.status(404).json({ message: "Игрок не найден" });
    }
    
    // Создаем заглушку для статистики игрока
    const playerStats = {
      id: playerId,
      name: user.name,
      gamesPlayed: 12 + Math.floor(Math.random() * 20),
      gamesWon: 5 + Math.floor(Math.random() * 10),
      totalPoints: 80 + Math.floor(Math.random() * 150),
      pointsPerGame: (15 + Math.floor(Math.random() * 8)) / 2,
      twoPointsMade: 20 + Math.floor(Math.random() * 40),
      twoPointsAttempted: 40 + Math.floor(Math.random() * 60),
      onePointsMade: 15 + Math.floor(Math.random() * 20),
      onePointsAttempted: 25 + Math.floor(Math.random() * 30),
      rebounds: 30 + Math.floor(Math.random() * 50),
      blocks: 5 + Math.floor(Math.random() * 15),
      assists: 10 + Math.floor(Math.random() * 30),
      steals: 8 + Math.floor(Math.random() * 12)
    };
    
    res.json(playerStats);
  } catch (error) {
    console.error("Ошибка при получении статистики игрока:", error);
    res.status(500).json({ message: "Ошибка при получении статистики" });
  }
});

// Получение рейтинга игроков
app.get("/api/players/rankings", async (req, res) => {
  const { category = 'points', limit = 10 } = req.query;
  
  try {
    const users = await User.findAll({ limit: parseInt(limit) });
    
    if (!users.length) {
      return res.json([]);
    }
    
    // Создаем рейтинг из существующих пользователей
    const rankings = users.map((user, index) => ({
      id: user.id,
      name: user.name,
      rating: 1500 - (index * 50) + Math.floor(Math.random() * 100),
      gamesPlayed: 10 + Math.floor(Math.random() * 20),
      gamesWon: 5 + Math.floor(Math.random() * 10),
      totalPoints: 100 + Math.floor(Math.random() * 200)
    }));
    
    // Сортируем по выбранной категории
    if (category === 'points') {
      rankings.sort((a, b) => b.totalPoints - a.totalPoints);
    } else if (category === 'rating') {
      rankings.sort((a, b) => b.rating - a.rating);
    } else if (category === 'games') {
      rankings.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
    }
    
    res.json(rankings);
  } catch (error) {
    console.error("Ошибка при получении рейтинга игроков:", error);
    res.status(500).json({ message: "Ошибка при получении рейтинга" });
  }
});

// API для push-уведомлений
app.post("/api/notifications/subscribe", authMiddleware, async (req, res) => {
  const { subscription } = req.body;
  const userId = req.user.id;
  
  try {
    // В реальном приложении здесь бы сохранялась подписка в базу данных
    console.log(`Пользователь ${userId} подписался на уведомления`);
    res.status(201).json({ message: "Подписка успешно создана" });
  } catch (error) {
    console.error("Ошибка при создании подписки:", error);
    res.status(500).json({ message: "Ошибка при создании подписки" });
  }
});

app.post("/api/notifications/unsubscribe", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  
  try {
    // В реальном приложении здесь бы удалялась подписка из базы данных
    console.log(`Пользователь ${userId} отписался от уведомлений`);
    res.json({ message: "Подписка успешно удалена" });
  } catch (error) {
    console.error("Ошибка при удалении подписки:", error);
    res.status(500).json({ message: "Ошибка при удалении подписки" });
  }
});

// Методы для B2B-интеграции
app.post("/api/business/sponsor-request", authMiddleware, async (req, res) => {
  const { tournamentId, sponsorName, sponsorLogo, sponsorMessage, contactEmail } = req.body;
  const userId = req.user.id;
  
  try {
    // В реальном приложении здесь бы создавался запрос на спонсорство
    const sponsorRequest = {
      id: `sponsor-${Date.now()}`,
      tournamentId,
      sponsorName,
      sponsorLogo,
      sponsorMessage,
      contactEmail,
      userId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    console.log("Получен запрос на спонсорство:", sponsorRequest);
    res.status(201).json(sponsorRequest);
  } catch (error) {
    console.error("Ошибка при создании запроса на спонсорство:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Получение списка команд пользователя
app.get("/api/user/teams", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const user = await User.findByPk(userId, {
      include: [
        { 
          model: Registration, 
          as: 'Teams',
          include: [
            { model: Tournament },
            { model: User, as: 'Captain' },
            { model: User, as: 'Players' }
          ]
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    
    res.json(user.Teams);
  } catch (error) {
    console.error("Ошибка при получении команд пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

sequelize.sync({ alter: true })  // или { force: true } для пересоздания таблиц
.then(() => {
  console.log("База данных синхронизирована");
  app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
  });
})
.catch((error) => console.error("Ошибка при синхронизации:", error));

sequelize.authenticate()
.then(() => console.log("Подключение к базе данных установлено"))
.catch(err => console.error("Ошибка подключения:", err));