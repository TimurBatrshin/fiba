import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./tournaments.css";  // Импортируем стили

const Tournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [filters, setFilters] = useState({ date: '', location: '', level: '' });
  
    useEffect(() => {
        const fetchTournaments = async () => {
          const query = new URLSearchParams(filters).toString();
          const response = await axios.get(`http://localhost:8080/api/tournaments?${query}`);
          const data = await response.data;
          setTournaments(data);
        };

        fetchTournaments();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
      };

  return (
    <div className="tournaments-container">
      <h1>Список турниров</h1>

      {/* Фильтры */}
      <div className="filters-container">
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Локация"
          value={filters.location}
          onChange={handleFilterChange}
        />
        <select name="level" value={filters.level} onChange={handleFilterChange}>
          <option value="">Выберите уровень</option>
          <option value="amateur">Любительский</option>
          <option value="professional">Профессиональный</option>
        </select>
      </div>

      {/* Список турниров */}
      <ul className="tournament-list">
        {tournaments.map((tournament) => (
          <li key={tournament.id} className="tournament-item">
            <h3>{tournament.name}</h3>
            <p>{tournament.date}</p>
            <p>{tournament.location}</p>
            <p>{tournament.level}</p>
            <Link to={`/tournament/${tournament.id}`}>Подробнее</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tournaments;
