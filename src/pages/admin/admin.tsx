import './admin.css';
import React, { useState } from "react";
import axios from 'axios';

const Admin: React.FC = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [level, setLevel] = useState('');
  const [prizePool, setPrizePool] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/tournaments/business', {
        title,
        date,
        location,
        level,
        prize_pool: prizePool,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Турнир успешно создан');
    } catch (error) {
      alert('Ошибка при создании турнира');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название турнира" />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Дата турнира" />
      <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Локация" />
      <input type="text" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Уровень" />
      <input type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} placeholder="Призовой фонд" />
      <button type="submit">Создать турнир</button>
    </form>
  );
};
export default Admin;
