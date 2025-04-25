import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { tournamentService } from '../../services/TournamentService';
import { Tournament, TournamentStatus } from '../../interfaces/Tournament';
import './create-tournament.css';

const CreateTournament: React.FC = () => {
  const navigate = useNavigate();
  const { currentRole } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    level: 'amateur',
    prize_pool: '',
    tournament_image: null as File | null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentRole?.toUpperCase() !== 'ADMIN') {
      navigate('/');
    }
  }, [currentRole, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        tournament_image: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Создаем объект турнира
      const tournamentData: Omit<Tournament, 'id'> = {
        title: formData.title,
        name: formData.title,
        date: formData.date,
        location: formData.location,
        level: formData.level.toUpperCase(),
        prizePool: formData.prize_pool,
        status: 'UPCOMING' as TournamentStatus,
        registrationOpen: true
      };

      // Создаем турнир через сервис
      await tournamentService.createTournament(tournamentData);

      // После успешного создания турнира
      navigate('/tournaments', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при создании турнира');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-tournament-container">
      <h1>Создание нового турнира</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="tournament-form">
        <div className="form-group">
          <label htmlFor="title">Название турнира*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            minLength={2}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Дата проведения*</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            min={new Date().toISOString().split('T')[0]} // Минимальная дата - сегодня
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Место проведения*</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            minLength={2}
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label htmlFor="level">Уровень турнира*</label>
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleInputChange}
            required
          >
            <option value="amateur">Любительский</option>
            <option value="pro">Профессиональный</option>
            <option value="elite">Элитный</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="prize_pool">Призовой фонд*</label>
          <input
            type="number"
            id="prize_pool"
            name="prize_pool"
            value={formData.prize_pool}
            onChange={handleInputChange}
            required
            min="0"
            step="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tournament_image">Изображение турнира</label>
          <input
            type="file"
            id="tournament_image"
            name="tournament_image"
            accept="image/*"
            onChange={handleFileChange}
          />
          <small className="input-help">Рекомендуемый размер: 1200x630 пикселей</small>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Создание...' : 'Создать турнир'}
        </button>
      </form>
    </div>
  );
};

export default CreateTournament; 