import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createBusinessTournament } from '../../services/api/tournaments';
import AuthService from '../../services/AuthService';
import './AdminPanel.css';

const CreateTournament: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    level: 'amateur',
    prize_pool: 0,
    sponsor_name: '',
    sponsor_logo: '',
    business_type: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check for required roles
  const isAdmin = AuthService.hasRole('ADMIN');
  const isBusiness = AuthService.hasRole('BUSINESS');

  if (!isAdmin && !isBusiness) {
    return (
      <div className="admin-section">
        <h1>Доступ запрещен</h1>
        <p>У вас нет прав для создания турниров.</p>
        <Link to="/admin" className="back-link">← Вернуться в панель управления</Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'prize_pool' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await createBusinessTournament(formData);
      setSuccess(true);
      // Reset form
      setFormData({
        title: '',
        date: '',
        location: '',
        level: 'amateur',
        prize_pool: 0,
        sponsor_name: '',
        sponsor_logo: '',
        business_type: ''
      });
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err) {
      console.error('Error creating tournament:', err);
      setError('Ошибка при создании турнира. Пожалуйста, проверьте введенные данные и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-section">
      <h1>Создание нового турнира</h1>
      
      {success && (
        <div className="success-message">
          Турнир успешно создан! Вы будете перенаправлены на главную страницу админ-панели.
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="tournament-form">
        <div className="form-group">
          <label htmlFor="title">Название турнира *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Введите название турнира"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Дата проведения *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Место проведения *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="Введите адрес проведения"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="level">Уровень турнира *</label>
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
          >
            <option value="amateur">Любительский</option>
            <option value="semi-pro">Полупрофессиональный</option>
            <option value="professional">Профессиональный</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="prize_pool">Призовой фонд (руб) *</label>
          <input
            type="number"
            id="prize_pool"
            name="prize_pool"
            value={formData.prize_pool}
            onChange={handleChange}
            required
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="sponsor_name">Название спонсора</label>
          <input
            type="text"
            id="sponsor_name"
            name="sponsor_name"
            value={formData.sponsor_name}
            onChange={handleChange}
            placeholder="Название компании-спонсора"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="sponsor_logo">URL логотипа спонсора</label>
          <input
            type="url"
            id="sponsor_logo"
            name="sponsor_logo"
            value={formData.sponsor_logo}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="business_type">Тип бизнеса</label>
          <input
            type="text"
            id="business_type"
            name="business_type"
            value={formData.business_type}
            onChange={handleChange}
            placeholder="Например: Спортивные товары, Развлечения и т.д."
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Создание...' : 'Создать турнир'}
          </button>
          <Link to="/admin" className="cancel-button">Отмена</Link>
        </div>
      </form>
    </div>
  );
};

export default CreateTournament; 