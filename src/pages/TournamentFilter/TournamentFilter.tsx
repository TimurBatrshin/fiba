import React, { useState } from 'react';

const TournamentFilter = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    date: '',
    location: '',
    level: ''
  });

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="date" 
        name="date" 
        value={filters.date} 
        onChange={handleChange} 
      />
      <input 
        type="text" 
        name="location" 
        placeholder="Локация" 
        value={filters.location} 
        onChange={handleChange} 
      />
      <select 
        name="level" 
        value={filters.level} 
        onChange={handleChange}
      >
        <option value="">Уровень</option>
        <option value="amateur">Любительский</option>
        <option value="professional">Профессиональный</option>
      </select>
      <button type="submit">Применить фильтры</button>
    </form>
  );
};

export default TournamentFilter;
