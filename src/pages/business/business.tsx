import React, { useState, useEffect } from "react";
import axios from "axios";
import "./business.css";

const Business = () => {
  const [tournaments, setTournaments] = useState([]);
  const [ads, setAds] = useState([]);
  
  const [tournamentName, setTournamentName] = useState("");
  const [tournamentDate, setTournamentDate] = useState("");
  const [tournamentLocation, setTournamentLocation] = useState("");
  
  const [adTitle, setAdTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tournaments");
        setTournaments(response.data);
      } catch (error) {
        console.error("Ошибка при получении турниров", error);
      }
    };
    
    const fetchAds = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/ads");
        setAds(response.data);
      } catch (error) {
        console.error("Ошибка при получении рекламы", error);
      }
    };
    
    fetchTournaments();
    fetchAds();
  }, []);

  const handleCreateTournament = async () => {
    if (!tournamentName || !tournamentDate || !tournamentLocation) {
      setError("Пожалуйста, заполните все поля для турнира!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/tournaments", {
        name: tournamentName,
        date: tournamentDate,
        location: tournamentLocation,
      });
      setTournaments([...tournaments, response.data]);
      setError('');
      alert("Турнир успешно создан!");
    } catch (error) {
      console.error("Ошибка при создании турнира", error);
      setError("Ошибка при создании турнира.");
    }
  };

  const handleAddAd = async () => {
    if (!adTitle) {
      setError("Пожалуйста, введите название рекламы!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/ads", {
        title: adTitle,
        status: "Ожидает одобрения",
      });
      setAds([...ads, response.data]);
      setError('');
      alert("Реклама успешно добавлена!");
    } catch (error) {
      console.error("Ошибка при добавлении рекламы", error);
      setError("Ошибка при добавлении рекламы.");
    }
  };

  return (
    <div className="business-container">
      <h1>Для бизнеса</h1>
      
      <div className="tournaments-section">
        <h2>Создание и управление турнирами</h2>
        <div className="form-section">
          <input
            type="text"
            placeholder="Название турнира"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
          />
          <input
            type="date"
            value={tournamentDate}
            onChange={(e) => setTournamentDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Локация"
            value={tournamentLocation}
            onChange={(e) => setTournamentLocation(e.target.value)}
          />
          <button onClick={handleCreateTournament} className="create-btn">
            Создать турнир
          </button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <ul>
          {tournaments.map((tournament, index) => (
            <li key={index} className="tournament-item">
              <h3>{tournament.name}</h3>
              <p>{tournament.date} - {tournament.location}</p>
            </li>
          ))}
        </ul>
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
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <ul>
          {ads.map((ad, index) => (
            <li key={index} className={`ad-item ${ad.status === "Активно" ? "active" : "pending"}`}>
              <h3>{ad.title}</h3>
              <p>Статус: {ad.status}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Business;
