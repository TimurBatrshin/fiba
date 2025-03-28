import { Link } from "react-router-dom";
import React from "react";
import './navbar.css';

const Navbar = () => {
    return (
      <nav className='navbar'>
        <ul className='nav-links'>
          <li><Link to="/">Главная</Link></li>
          <li><Link to="/tournaments">Турниры</Link></li>
          <li><Link to="/profile">Профиль</Link></li>
          <li><Link to="/business">Для бизнеса</Link></li>
        </ul>
      </nav>
    );
  };

export default Navbar;