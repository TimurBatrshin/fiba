const jwt = require('jsonwebtoken');
const fs = require('fs');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    fs.appendFileSync('server.log', `[${new Date().toISOString()}] Нет заголовка авторизации, авторизация отклонена\n`);
    return res.status(401).send('Нет заголовка авторизации, авторизация отклонена');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    fs.appendFileSync('server.log', `[${new Date().toISOString()}] Нет токена, авторизация отклонена\n`);
    return res.status(401).send('Нет токена, авторизация отклонена');
  }

  try {
    const decoded = jwt.verify(token, 'Timur007');
    req.user = decoded;
    next();
  } catch (err) {
    fs.appendFileSync('server.log', `[${new Date().toISOString()}] Неверный токен: ${err.message}\n`);
    res.status(401).send('Неверный токен');
  }
};

module.exports = authMiddleware;