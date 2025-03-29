const businessMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'business') {
    next();
  } else {
    res.status(403).send('Недостаточно прав для доступа');
  }
};

module.exports = businessMiddleware;