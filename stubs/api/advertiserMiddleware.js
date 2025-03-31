const businessMiddleware = (req, res, next) => {
    const { userId } = req;
  
    User.findByPk(userId).then(user => {
      if (!user || user.role !== 'advertiser') {
        return res.status(403).send('Доступ запрещен: требуется роль business');
      }
      next();
    }).catch(err => {
      res.status(500).send("Ошибка проверки пользователя");
    });
  }
  