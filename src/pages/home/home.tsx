import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import './home.css';
import AuthService from '../../services/AuthService';

// Импортируем изображения
import homeSlider1 from '../../assets/images/home-slider-1.jpg';
import homeSlider2 from '../../assets/images/home-slider-2.jpg';
import homeSlider3 from '../../assets/images/home-slider-3.jpg';
import heroBasketball from '../../assets/images/hero-basketball.jpg';
import defaultTournament from '../../assets/images/default-tournament.jpg';
import businessBasketball from '../../assets/images/business-basketball.jpg';

interface Tournament {
  id: string;
  name: string;
  location: string;
  date: string;
  level: string;
  image_url?: string;
}

const Home: React.FC = () => {
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const sliderImages = [homeSlider1, homeSlider2, homeSlider3];

  // Проверяем авторизацию при монтировании компонента
  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated());
  }, []);

  // Функция для автоматической смены слайдов
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderImages.length]);

  // Выносим функцию fetchUpcomingTournaments для мемоизации
  const fetchUpcomingTournaments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.get<Tournament[]>('/tournaments', {
        params: {
          limit: 4,
          sort: 'date',
          direction: 'asc',
          upcoming: true
        }
      });
      setUpcomingTournaments(response);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке турниров:', err);
      setError('Не удалось загрузить ближайшие турниры');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingTournaments();
  }, [fetchUpcomingTournaments]);

  return (
    <div className="home-container">
      {/* Hero секция с каруселью */}
      <section className="hero">
        <div className="hero-content container">
          <h1 className="hero-title animate-fade-in">
            Стритбол. <span className="highlight">Турниры. </span>
            <br />Твоя <span className="highlight">игра.</span>
          </h1>
          <p className="hero-description animate-fade-in">
            Регистрируйся на турниры FIBA 3x3, создавай команду 
            и покажи свое мастерство на площадке!
          </p>
          <div className="hero-cta animate-slide-up">
            <Link to="/tournaments" className="btn btn-primary">Найти турнир</Link>
            <Link to="/profile" className="btn btn-outline">Мой профиль</Link>
          </div>
          <div className="hero-stats animate-slide-up">
            <div className="stat-item">
              <span className="stat-value">150+</span>
              <span className="stat-label">Турниров</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">5000+</span>
              <span className="stat-label">Игроков</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">25+</span>
              <span className="stat-label">Городов</span>
            </div>
          </div>
        </div>
        <div className="hero-image-container">
          <div className="hero-slider">
            {sliderImages.map((img, index) => (
              <img 
                key={index}
                src={img} 
                alt={`Слайд ${index + 1}`} 
                className={`hero-image ${index === currentSlide ? 'active' : ''}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = heroBasketball;
                }}
              />
            ))}
            <div className="slider-dots">
              {sliderImages.map((_, index) => (
                <button 
                  key={index} 
                  className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Перейти к слайду ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ближайшие турниры */}
      <section className="upcoming-tournaments">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Ближайшие турниры</h2>
            <Link to="/tournaments" className="view-all-link">
              Смотреть все
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="tournaments-grid skeleton-loading">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="tournament-card skeleton">
                  <div className="tournament-image skeleton-image"></div>
                  <div className="tournament-info">
                    <div className="skeleton-line skeleton-title"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line skeleton-short"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => fetchUpcomingTournaments()} className="btn btn-outline">Попробовать снова</button>
            </div>
          ) : (
            <div className="tournaments-grid">
              {upcomingTournaments.length > 0 ? (
                upcomingTournaments.map((tournament) => (
                  <Link to={`/tournament/${tournament.id}`} key={tournament.id} className="tournament-card">
                    <div className="tournament-image">
                      <img 
                        src={tournament.image_url || defaultTournament} 
                        alt={tournament.name} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = defaultTournament;
                        }}
                      />
                      <div className="tournament-level">
                        {tournament.level === 'professional' ? 'Профессиональный' : 'Любительский'}
                      </div>
                    </div>
                    <div className="tournament-info">
                      <h3 className="tournament-name">{tournament.name}</h3>
                      <div className="tournament-meta">
                        <div className="meta-item">
                          <svg className="meta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>{new Date(tournament.date).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="meta-item">
                          <svg className="meta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>{tournament.location}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="no-tournaments">
                  <p>Турниров не найдено</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Как это работает */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title text-center">Как это работает</h2>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3 className="step-title">Регистрация</h3>
              <p className="step-description">
                Создайте аккаунт, заполните профиль и начните участвовать в турнирах FIBA 3x3.
              </p>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <h3 className="step-title">Создание команды</h3>
              <p className="step-description">
                Соберите команду из 3 основных игроков и одного запасного для участия в турнире.
              </p>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <h3 className="step-title">Участие</h3>
              <p className="step-description">
                Регистрируйтесь на турниры, участвуйте в играх и зарабатывайте рейтинг.
              </p>
            </div>
            <div className="step-item">
              <div className="step-number">4</div>
              <h3 className="step-title">Прогресс</h3>
              <p className="step-description">
                Отслеживайте свою статистику, улучшайте навыки и поднимайтесь в рейтинге.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Секция для бизнеса */}
      <section className="business-section">
        <div className="container">
          <div className="business-content">
            <h2 className="section-title">Для бизнеса</h2>
            <p className="business-description">
              Станьте частью сообщества FIBA 3x3! Получите доступ к целевой аудитории, 
              создавайте турниры и размещайте свою рекламу на мероприятиях.
            </p>
            <div className="business-features">
              <div className="feature-item">
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8H19C20.1046 8 21 8.89543 21 10V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V10C3 8.89543 3.89543 8 5 8H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 4H9C8.44772 4 8 4.44772 8 5V9C8 9.55228 8.44772 10 9 10H15C15.5523 10 16 9.55228 16 9V5C16 4.44772 15.5523 4 15 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="feature-text">
                  <h3>Организация турниров</h3>
                  <p>Создавайте и управляйте своими турнирами</p>
                </div>
              </div>
              <div className="feature-item">
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 2H8C7.44772 2 7 2.44772 7 3V21C7 21.5523 7.44772 22 8 22H16C16.5523 22 17 21.5523 17 21V3C17 2.44772 16.5523 2 16 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="feature-text">
                  <h3>Мобильные уведомления</h3>
                  <p>Push-уведомления для участников о ваших акциях</p>
                </div>
              </div>
              <div className="feature-item">
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="feature-text">
                  <h3>Брендирование</h3>
                  <p>Размещение логотипов на страницах турниров</p>
                </div>
              </div>
              <div className="feature-item">
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 20V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="feature-text">
                  <h3>Аналитика</h3>
                  <p>Отчеты о просмотрах и вовлеченности участников</p>
                </div>
              </div>
            </div>
            <Link to="/business" className="btn btn-secondary">Для бизнеса</Link>
          </div>
          <div className="business-image">
            <img src={businessBasketball} alt="Бизнес и стритбол" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultTournament;
              }}
            />
          </div>
        </div>
      </section>

      {/* CTA-секция */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Готовы начать?</h2>
          <p className="cta-description">Присоединяйтесь к сообществу FIBA 3x3 прямо сейчас!</p>
          <div className="cta-buttons">
            {!isAuthenticated && (
              <Link to="/register-user" className="btn btn-primary">Зарегистрироваться</Link>
            )}
            <Link to="/tournaments" className="btn btn-outline">Смотреть турниры</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
