import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faUser, faHome, faTrophy } from "@fortawesome/free-solid-svg-icons";
import fibaLogo from '../../assets/images/fiba-logo.png';
import { useAuth } from "../../contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser } from "../../store/slices/authSlice";
import { addToast } from "../../store/slices/uiSlice";

interface NavbarProps {
  isAuthenticated: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated: propIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { logout: contextLogout } = useAuth();
  
  // Используем состояние из Redux
  const { isAuthenticated: reduxIsAuthenticated } = useAppSelector(state => state.auth);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(propIsAuthenticated || reduxIsAuthenticated);
  const [showStatsDropdown, setShowStatsDropdown] = useState(false);

  useEffect(() => {
    // Приоритизируем Redux-состояние, но сохраняем обратную совместимость
    setIsAuthenticated(reduxIsAuthenticated || propIsAuthenticated || !!localStorage.getItem("token"));
    
    const handleScroll = () => setIsScrolled(window.pageYOffset > 10);
    window.addEventListener("scroll", handleScroll);
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [propIsAuthenticated, reduxIsAuthenticated]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    // Используем Redux для выхода
    dispatch(logoutUser());
    
    // Для обратной совместимости также используем contextLogout
    contextLogout();
    
    setIsAuthenticated(false);
    
    // Добавляем уведомление через Redux
    dispatch(addToast({
      type: 'success',
      message: 'Вы успешно вышли из системы'
    }));
    
    // Перенаправляем на страницу входа
    navigate('/login');
  };

  const toggleStatsDropdown = () => {
    setShowStatsDropdown(!showStatsDropdown);
  };

  const isStatsPage = () => {
    return ['/rankings/players', '/rankings/teams', '/top-players', '/players'].some(path => 
      location.pathname.startsWith(path)
    );
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

        <nav className={`navbar-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
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
            <li className="nav-item stats-dropdown">
              <div className="nav-dropdown">
                <button 
                  className={`nav-dropdown-btn ${isStatsPage() ? 'active' : ''}`} 
                  onClick={toggleStatsDropdown}
                >
                  <FontAwesomeIcon icon={faChartBar} />
                  <span>Статистика</span>
                </button>
                {showStatsDropdown && (
                  <div className="nav-dropdown-content">
                    <Link to="/top-players">
                      <FontAwesomeIcon icon={faUser} />
                      <span>Топ игроки</span>
                    </Link>
                  </div>
                )}
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
        </nav>
      </div>
    </header>
  );
};

export default Navbar;