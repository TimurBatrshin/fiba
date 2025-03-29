import React, { useState } from 'react';
import axios from 'axios';
import "./Ad.css";

const Ad = () => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tournamentId, setTournamentId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/ads', {
        title,
        image_url: imageUrl,
        tournament_id: tournamentId,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Реклама успешно предложена');
    } catch (error) {
      alert('Ошибка при предложении рекламы');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название рекламы" />
      <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL изображения" />
      <input type="number" value={tournamentId} onChange={(e) => setTournamentId(e.target.value)} placeholder="ID турнира" />
      <button type="submit">Предложить рекламу</button>
    </form>
  );
};


export default Ad;