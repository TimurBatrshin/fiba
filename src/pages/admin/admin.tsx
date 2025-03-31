import './admin.css';
import React, { useState } from "react";
import axios from 'axios';

const Admin: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    level: '',
    prize_pool: 0,
    rules: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/tournaments/business", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      alert('Турнир успешно создан!');
      console.log("Созданный турнир:", response.data);
    } catch (error) {
      console.error("Ошибка при создании турнира:", error);
      alert("Ошибка при создании турнира");
    }
  };

  return (
    <div className="create-tournament-container">
      <h1>Создание турнира</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Название</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Дата</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>
        <div>
          <label>Локация</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} required />
        </div>
        <div>
          <label>Уровень</label>
          <select name="level" value={formData.level} onChange={handleChange} required>
            <option value="">Выберите уровень</option>
            <option value="amateur">Любительский</option>
            <option value="professional">Профессиональный</option>
          </select>
        </div>
        <div>
          <label>Призовой фонд</label>
          <input type="number" name="prize_pool" value={formData.prize_pool} onChange={handleChange} required />
        </div>
        <div>
          <label>Правила</label>
          <textarea name="rules" value={formData.rules} onChange={handleChange} required />
        </div>
        <button type="submit">Создать турнир</button>
      </form>
    </div>
  );
};

export default Admin;
