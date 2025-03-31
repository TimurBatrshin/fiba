import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./tournaments.css";  // Импортируем стили
import TournamentFilter from '../TournamentFilter/TournamentFilter';

const Tournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [filters, setFilters] = useState({ date: '', location: '', level: '' });
  
    
      const fetchTournaments = async (filters) => {
        const response = await axios.get('http://localhost:8080/api/tournaments', { params: filters });
        setTournaments(response.data);
      };

      useEffect(() => {
        fetchTournaments({});
      }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
      };

  return (
    <div className="tournaments-container">
      <h1>Список турниров</h1>
      <div>
      <TournamentFilter onFilter={fetchTournaments} />
      <div>
        {tournaments.map((tournament) => (
          <div key={tournament.id}>
            <h2>{tournament.name}</h2>
            <p>{tournament.date} - {tournament.location}</p>
          </div>
        ))}
      </div>
    </div>
      {/* Фильтры */}
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
