const axios = require('axios'); 

const businessMiddleware = (req, res, next) => {
  const userId = '1';

  axios.get(`http://localhost:9090/api/users/${userId}`)
    .then(response => {
      const user = response.data;  // Данные о пользователе, возвращенные сервером

      // Проверяем роль пользователя
      if (!user || user.role !== 'business') {
        return res.status(403).send('Доступ запрещен: требуется роль business');
      }

      // Если роль корректная, продолжаем выполнение
      next();
    })
    .catch(err => {
      console.error("Ошибка при запросе данных пользователя", err);
      res.status(500).send("Ошибка при проверке пользователя");
    });
};

module.exports = businessMiddleware;