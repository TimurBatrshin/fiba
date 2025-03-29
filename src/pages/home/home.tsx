import React from "react";
import './home.css';
import { Link } from "react-router-dom";

const Home = () => {
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
        </ul>
      </div>
      <div className="info-section">
        <h2>Как использовать платформу?</h2>
        <p>На этой платформе вы можете:</p>
        <ul>
          <li>Принять участие в турнирах по стритболу</li>
          <li>Зарегистрировать свою команду</li>
          <li>Следить за результатами игр и рейтингами</li>
        </ul>
        <p>Для получения дополнительной информации посетите <Link to="/faq">FAQ</Link>.</p>
      </div>
    </div>
  );
}

export default Home;
