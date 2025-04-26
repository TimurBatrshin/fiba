import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faUser, faHome, faTrophy, faPlus } from "@fortawesome/free-solid-svg-icons";
import fibaLogo from '../../assets/images/fiba-logo.png';
import { useAuth } from "../../contexts/AuthContext";
import { BASE_PATH } from '../../config/envConfig';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout: contextLogout, currentRole } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isAdmin = currentRole?.toUpperCase() === 'ADMIN';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.pageYOffset > 10);
    window.addEventListener("scroll", handleScroll);
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    contextLogout();
  };

  const isStatsPage = () => {
    return ['/rankings/players', '/rankings/teams', '/top-players', '/players'].some(path => 
      location.pathname.startsWith(path)
    );
  };

  const isTopPlayersPage = () => {
    return location.pathname === '/top-players';
  };

  return (
    <header className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            <img src={fibaLogo} alt="FIBA 3x3" className="logo-image" />
            <span className="logo-text">FIBA</span>
            <span className="logo-accent">3x3</span>
          </Link>
        </div>

        <button 
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Меню"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <div className={`navbar-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <nav className="nav-content">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/" className={`nav-link ${location.pathname === '/' || location.pathname === '' ? 'active' : ''}`}>
                  <FontAwesomeIcon icon={faHome} className="nav-icon" />
                  <span>Главная</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/tournaments" className={`nav-link ${location.pathname === '/tournaments' ? 'active' : ''}`}>
                  <FontAwesomeIcon icon={faTrophy} className="nav-icon" />
                  <span>Турниры</span>
                </Link>
              </li>
              {isAdmin && isAuthenticated && (
                <li className="nav-item">
                  <Link to="/create-tournament" className="nav-link admin-link">
                    <FontAwesomeIcon icon={faPlus} className="nav-icon" />
                    <span>Создать турнир</span>
                  </Link>
                </li>
              )}
              <li className="nav-item stats-dropdown">
                <div className="nav-dropdown">
                  <button 
                    className={`nav-dropdown-btn ${isStatsPage() ? 'active' : ''}`}
                  >
                    <FontAwesomeIcon icon={faChartBar} />
                    <span>Статистика</span>
                  </button>
                  <div className="nav-dropdown-content">
                    <Link 
                      to="/top-players"
                      className={isTopPlayersPage() ? 'active' : ''}
                    >
                      <FontAwesomeIcon icon={faUser} />
                      <span>Топ игроки</span>
                    </Link>
                  </div>
                </div>
              </li>
              {isAuthenticated && (
                <li className="nav-item">
                  <Link 
                    to="/profile" 
                    className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                  >
                    <FontAwesomeIcon icon={faUser} className="nav-icon" />
                    <span>Профиль</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className="nav-actions">
            <div className="nav-auth">
              {isAuthenticated ? (
                <button 
                  onClick={handleLogout} 
                  className="btn-logout"
                  data-cy="logout-button"
                >
                  <span>Выйти</span>
                </button>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn-login">
                    <span>Войти</span>
                  </Link>
                  <Link to="/register-user" className="btn-signup">
                    <span>Регистрация</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;