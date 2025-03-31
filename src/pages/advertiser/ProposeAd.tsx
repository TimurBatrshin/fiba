import React, { useState } from 'react';
import axios from 'axios';
import "./proposeAd.css";

const ProposeAd: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    tournament_id: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/ads/propose", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      alert('Реклама успешно предложена!');
      console.log("Предложенная реклама:", response.data);
    } catch (error) {
      console.error("Ошибка при предложении рекламы:", error);
      alert("Ошибка при предложении рекламы");
    }
  };

  return (
    <div className="propose-ad-container">
      <h1>Предложить рекламу</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Название рекламы</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="image_url">URL изображения</label>
          <input
            type="text"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="tournament_id">ID турнира</label>
          <input
            type="number"
            id="tournament_id"
            name="tournament_id"
            value={formData.tournament_id}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Отправить предложение</button>
      </form>
    </div>
  );
};

export default ProposeAd;
