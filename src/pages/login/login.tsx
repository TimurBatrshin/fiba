import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./login.css";  // Импортируем стили

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      setLocalError(error.message);
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
    // Сбрасываем ошибку при изменении полей
    if (localError) setLocalError("");
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      // После успешного входа перенаправление на profile произойдет через useEffect
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.response?.status === 401) {
        setLocalError("Неверный email или пароль");
      } else if (err.response?.data?.message) {
        setLocalError(err.response.data.message);
      } else {
        setLocalError("Ошибка при входе. Попробуйте снова позже.");
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card animate-fade-in">
          <div className="auth-header">
            <h1>Вход в аккаунт</h1>
            <p>Войдите для доступа к турнирам и управления командой</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="currentColor"/>
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="Введите ваш email"
                  required
                  className={localError ? "error" : ""}
                  disabled={isLoading}
                  data-cy="email-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="currentColor"/>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  placeholder="Введите ваш пароль"
                  required
                  className={localError ? "error" : ""}
                  disabled={isLoading}
                  data-cy="password-input"
                />
                <button 
                  type="button" 
                  onClick={toggleShowPassword} 
                  className="password-toggle"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 7C14.76 7 17 9.24 17 12C17 12.65 16.87 13.26 16.64 13.83L19.56 16.75C21.07 15.49 22.26 13.86 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8 5.2L10.17 7.37C10.74 7.13 11.35 7 12 7ZM2 4.27L4.28 6.55L4.74 7.01C3.08 8.3 1.78 10.02 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.8 19.08L19.73 22L21 20.73L3.27 3L2 4.27ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM11.84 9.02L14.99 12.17L15.01 12.01C15.01 10.35 13.67 9.01 12.01 9.01L11.84 9.02Z" fill="currentColor"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {localError && <div className="error-message" data-cy="error-message">{localError}</div>}
            
            
            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={isLoading}
              data-cy="login-button"
            >
              {isLoading ? (
                <div className="button-loader">
                  <span className="loader-dot"></span>
                  <span className="loader-dot"></span>
                  <span className="loader-dot"></span>
                </div>
              ) : "Войти"}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Еще нет аккаунта? <Link to="/register-user">Зарегистрироваться</Link></p>
          </div>
          
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
