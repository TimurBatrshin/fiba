import './home.css';
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRoleContext } from "../../context/UserRoleContext";

const Home = () => {
  const { role, loading } = useContext(UserRoleContext);
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Добро пожаловать на платформу для турниров по стритболу!</h1>
      <p>Здесь можно зарегистрироваться на турниры, создать команду и отслеживать результаты.</p>
      <div className="quick-links">
        <h2>Быстрые ссылки</h2>
        <ul>
          <li><Link to="/tournaments">Турниры</Link></li>
          <li><Link to="/register">Зарегистрировать команду</Link></li>
          <li><Link to="/profile">Мой профиль</Link></li>
          <li><Link to="/register-user">Регистрация</Link></li>
          <li><Link to="/admin">Home</Link></li>
        </ul>
      </div>
      <div className="info-section">
        <h2>Как использовать платформу?</h2>
        <p>На этой платформе вы можете:</p>
        <ul>
          <li>Принять участие в турнирах по стритболу</li>
          <li>Зарегистрировать свою команду</li>
          <li>Следить за результатами игр и рейтингами</li>
          <li>Пройти регистрацию на сайт</li>
        </ul>
        <p>Для получения дополнительной информации посетите <Link to="/faq">FAQ</Link>.</p>
      </div>
    </div>
  );
}

export default Home;
