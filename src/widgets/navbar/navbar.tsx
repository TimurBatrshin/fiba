import { Link } from "react-router-dom";
import React, {useContext} from "react";
import './navbar.css';
import { UserRoleContext } from "../../context/UserRoleContext";

const Navbar = ({ isAuthenticated }: { isAuthenticated: boolean }) => {

  const { role } = useContext(UserRoleContext);
    return (
      <nav className='navbar'>
        <ul className='nav-links'>
          <li><Link to="/">Главная</Link></li>
          <li><Link to="/tournaments">Турниры</Link></li>
          {isAuthenticated ? (
          <li><Link to="/profile">Профиль</Link></li>
        ) : (
          <li><Link to="/login">Войти</Link></li>
        )}
          {role === 'business' && <li><Link to="/business">Для бизнеса</Link></li>}
        </ul>
      </nav>
    );
  };

export default Navbar;