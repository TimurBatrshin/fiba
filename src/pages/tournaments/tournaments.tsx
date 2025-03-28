import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./tournaments.css";

const Tournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [filters, setFilters] = useState({ date: '', location: '', level: '' });
  
    useEffect(() => {
        const fetchTournaments = async () => {
          const query = new URLSearchParams(filters).toString();
          const response = await fetch(`/api/tournaments?${query}`);
          const data = await response.json();
          setTournaments(data);
        };

        fetchTournaments();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
      };

  return (
    <div>
      <h1>Список турниров</h1>
      <div>
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
      <ul>
        {tournaments.map((tournament) => (
          <li key={tournament.id}>
            <h3>{tournament.name}</h3>
            <p>{tournament.date}</p>
            <p>{tournament.location}</p>
            <p>{tournament.level}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tournaments;
