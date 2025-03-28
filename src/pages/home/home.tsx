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
    </div>
  );
}

export default Home;