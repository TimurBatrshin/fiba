import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import "./login.css";  // Импортируем стили

interface LoginProps {
  setIsAuthenticated: (value: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector(state => state.auth);
  
  // Перенаправление на профиль, если пользователь авторизован
  useEffect(() => {
    if (isAuthenticated) {
      setIsAuthenticated(true);
      navigate("/profile");
    }
  }, [isAuthenticated, navigate, setIsAuthenticated]);
  
  // Показ уведомления об ошибке, если она есть
  useEffect(() => {
    if (error) {
      dispatch(addToast({
        type: 'error',
        message: error
      }));
      dispatch(clearError());
    }
  }, [error, dispatch]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      dispatch(addToast({
        type: 'error',
        message: 'Пожалуйста, заполните все поля'
      }));
      return;
    }
    
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      dispatch(addToast({
        type: 'success',
        message: 'Вход выполнен успешно'
      }));
    } catch (err) {
      // Ошибка уже обрабатывается в useEffect выше
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card animate-fade-in">
          <div className="auth-header">
            <h1>Вход в аккаунт</h1>
            <p>Введите ваши учетные данные для входа</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Поле Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Введите ваш email"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Поле пароля */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Пароль</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={toggleShowPassword}
                  tabIndex={-1}
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Входим...' : 'Войти'}
              </button>
            </div>
            
            <div className="auth-links">
              <p className="text-center">
                Нет аккаунта? <a href="/register-user">Зарегистрироваться</a>
              </p>
            </div>
          </form>
          
          <div className="auth-background">
            <svg className="auth-blob" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="var(--primary-light)" opacity="0.1" d="M42.7,-62.9C53.9,-52.2,61.1,-37.7,64.6,-23.1C68,-8.5,67.6,6.2,62.4,19.2C57.1,32.2,47,43.5,35,53.4C23,63.2,9.1,71.5,-5.9,74C-20.9,76.4,-41.7,72.9,-56.2,61.8C-70.7,50.7,-78.8,32,-81.4,12.6C-84,-6.8,-81.1,-27,-71.3,-42.1C-61.5,-57.2,-44.9,-67.4,-28.8,-74.7C-12.7,-82,3.9,-86.4,18.8,-81C33.8,-75.6,67.6,-60.4,42.7,-62.9Z" transform="translate(100 100)" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
