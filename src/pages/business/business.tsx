import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from '../../config/envConfig';
import { createBusinessTournament } from '../../services/api/tournaments';
import "./business.css";

const Business = () => {
  const [tournaments, setTournaments] = useState([]);
  const [ads, setAds] = useState([]);
  const [adResults, setAdResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Форма для создания бизнес-турнира
  const [tournamentFormData, setTournamentFormData] = useState({
    title: "",
    date: "",
    location: "",
    level: "amateur",
    prize_pool: 0,
    sponsor_name: "",
    sponsor_logo: "",
    business_type: ""
  });
  
  const [adTitle, setAdTitle] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Для доступа к странице необходима авторизация");
      return;
    }
    
    fetchTournaments();
    fetchAds();
    fetchAdResults();
  }, []);
  
  const fetchTournaments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Отсутствует токен авторизации");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/tournaments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTournaments(response.data);
    } catch (error) {
      console.error("Ошибка при получении турниров", error);
    }
  };

  const fetchAds = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Отсутствует токен авторизации");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/ads`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAds(response.data);
    } catch (error) {
      console.error("Ошибка при получении рекламы", error);
    }
  };

  const fetchAdResults = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Отсутствует токен авторизации");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/ad-results`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAdResults(response.data);
    } catch (error) {
      console.error("Ошибка при получении результатов рекламы", error);
    }
  };

  const handleTournamentFormChange = (e) => {
    const { name, value } = e.target;
    setTournamentFormData(prev => ({
      ...prev,
      [name]: name === 'prize_pool' ? parseInt(value) || 0 : value
    }));
  };

  const handleCreateBusinessTournament = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    const requiredFields = ['title', 'date', 'location', 'level', 'prize_pool', 'sponsor_name'];
    const emptyFields = requiredFields.filter(field => !tournamentFormData[field]);
    
    if (emptyFields.length > 0) {
      setError(`Пожалуйста, заполните обязательные поля: ${emptyFields.join(', ')}`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await createBusinessTournament(tournamentFormData);
      setTournaments(prev => [...prev, response]);
      
      // Сбросить форму
      setTournamentFormData({
        title: "",
        date: "",
        location: "",
        level: "amateur",
        prize_pool: 0,
        sponsor_name: "",
        sponsor_logo: "",
        business_type: ""
      });
      
      setSuccessMessage("Бизнес-турнир успешно создан!");
      fetchTournaments(); // Обновить список турниров
    } catch (error) {
      console.error("Ошибка при создании бизнес-турнира", error);
      setError(error.response?.data?.message || "Ошибка при создании турнира");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAd = async () => {
    if (!adTitle) {
      setError("Пожалуйста, введите название рекламы!");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Для добавления рекламы необходима авторизация");
        return;
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/ads`, 
        {
          title: adTitle,
          status: "Ожидает одобрения",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setAds([...ads, response.data]);
      setError('');
      setAdTitle('');
      setSuccessMessage("Реклама успешно добавлена!");
    } catch (error) {
      console.error("Ошибка при добавлении рекламы", error);
      setError(error.response?.data?.message || "Ошибка при добавлении рекламы.");
    }
  };

  return (
    <div className="business-container">
      <h1>Для бизнеса</h1>

      <div className="tournaments-section">
        <h2>Создание спонсорского турнира</h2>
        {successMessage && <p className="success-message">{successMessage}</p>}
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleCreateBusinessTournament} className="business-tournament-form">
          <div className="form-group">
            <label htmlFor="title">Название турнира *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={tournamentFormData.title}
              onChange={handleTournamentFormChange}
              placeholder="Введите название турнира"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="date">Дата проведения *</label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={tournamentFormData.date}
              onChange={handleTournamentFormChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Место проведения *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={tournamentFormData.location}
              onChange={handleTournamentFormChange}
              placeholder="Введите адрес проведения"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="level">Уровень турнира *</label>
            <select
              id="level"
              name="level"
              value={tournamentFormData.level}
              onChange={handleTournamentFormChange}
              required
            >
              <option value="amateur">Любительский</option>
              <option value="semi-pro">Полупрофессиональный</option>
              <option value="professional">Профессиональный</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="prize_pool">Призовой фонд *</label>
            <input
              type="number"
              id="prize_pool"
              name="prize_pool"
              value={tournamentFormData.prize_pool}
              onChange={handleTournamentFormChange}
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="sponsor_name">Название спонсора *</label>
            <input
              type="text"
              id="sponsor_name"
              name="sponsor_name"
              value={tournamentFormData.sponsor_name}
              onChange={handleTournamentFormChange}
              placeholder="Название вашей компании"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="sponsor_logo">Логотип спонсора (URL)</label>
            <input
              type="url"
              id="sponsor_logo"
              name="sponsor_logo"
              value={tournamentFormData.sponsor_logo}
              onChange={handleTournamentFormChange}
              placeholder="Ссылка на логотип вашей компании"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="business_type">Тип бизнеса</label>
            <input
              type="text"
              id="business_type"
              name="business_type"
              value={tournamentFormData.business_type}
              onChange={handleTournamentFormChange}
              placeholder="Например: Спортивные товары, IT, Финансы"
            />
          </div>
          
          <button 
            type="submit" 
            className="create-btn" 
            disabled={isLoading}
          >
            {isLoading ? "Создание..." : "Создать бизнес-турнир"}
          </button>
        </form>
      </div>

      <div className="current-tournaments-section">
        <h2>Текущие турниры</h2>
        <div className="tournaments-list">
          {tournaments.length > 0 ? (
            <ul>
              {tournaments.map((tournament, index) => (
                <li key={index} className="tournament-item">
                  <h3>{tournament.title}</h3>
                  <p>Дата: {new Date(tournament.date).toLocaleDateString()}</p>
                  <p>Место: {tournament.location}</p>
                  <p>Уровень: {tournament.level}</p>
                  <p>Призовой фонд: {tournament.prize_pool}</p>
                  {tournament.sponsor_name && <p>Спонсор: {tournament.sponsor_name}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p>Нет доступных турниров</p>
          )}
        </div>
      </div>

      <div className="ads-section">
        <h2>Реклама для бизнеса</h2>
        <div className="form-section">
          <input
            type="text"
            placeholder="Название рекламы"
            value={adTitle}
            onChange={(e) => setAdTitle(e.target.value)}
          />
          <button onClick={handleAddAd} className="create-btn">
            Добавить рекламу
          </button>
        </div>
        <ul>
          {ads.map((ad, index) => (
            <li key={index} className={`ad-item ${ad.status === "Активно" ? "active" : "pending"}`}>
              <h3>{ad.title}</h3>
              <p>Статус: {ad.status}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="ad-results-section">
        <h2>Результаты рекламы</h2>
        <ul>
          {adResults.map((result, index) => (
            <li key={index}>
              <h3>Реклама ID: {result.adId}</h3>
              <p>Клики: {result.clicks}</p>
              <p>Показы: {result.impressions}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Business;
