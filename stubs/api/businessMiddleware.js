const businessMiddleware = (req, res, next) => {
  const { userId } = req;

  User.findByPk(userId).then(user => {
    if (!user || user.role !== 'business') {
      return res.status(403).send('Доступ запрещен: требуется роль business');
    }
    next();
  }).catch(err => {
    res.status(500).send("Ошибка проверки пользователя");
  });
}

// Middleware для проверки рекламного аккаунта
const advertiserMiddleware = (req, res, next) => {
  const { userId } = req;

  User.findByPk(userId).then(user => {
    if (!user || user.role !== 'advertiser') {
      return res.status(403).send('Доступ запрещен: требуется роль advertiser');
    }
    next();
  }).catch(err => {
    res.status(500).send("Ошибка проверки пользователя");
  });
}
