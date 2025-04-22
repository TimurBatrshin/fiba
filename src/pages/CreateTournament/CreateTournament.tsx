import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faCalendarAlt, faMapMarkerAlt, faMoneyBillWave, faBuilding } from '@fortawesome/free-solid-svg-icons';
import './CreateTournament.css';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/ApiService';

interface TournamentFormData {
  name: string;
  date: string;
  location: string;
  level: string;
  prize_pool: number;
  description: string;
  image_url?: string;
  sponsor_name?: string;
  sponsor_logo?: string;
  business_type?: string;
}

const CreateTournament: React.FC = () => {
  const navigate = useNavigate();
  const { currentRole, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    date: '',
    location: '',
    level: 'amateur',
    prize_pool: 0,
    description: '',
    image_url: '',
    sponsor_name: '',
    sponsor_logo: '',
    business_type: '',
  });
  const [isBusinessTournament, setIsBusinessTournament] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Проверяем права доступа
  useEffect(() => {
    if (!isAuthenticated || currentRole !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, currentRole, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'prize_pool' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Если это не бизнес-турнир, удаляем связанные поля
      const dataToSend = { ...formData };
      if (!isBusinessTournament) {
        delete dataToSend.sponsor_name;
        delete dataToSend.sponsor_logo;
        delete dataToSend.business_type;
      }

      // Отправляем данные на сервер
      const response = await ApiService.post('/tournaments', dataToSend);
      
      console.log('Турнир успешно создан:', response);
      
      setSuccess('Турнир успешно создан!');
      
      // Очищаем форму
      setFormData({
        name: '',
        date: '',
        location: '',
        level: 'amateur',
        prize_pool: 0,
        description: '',
        image_url: '',
        sponsor_name: '',
        sponsor_logo: '',
        business_type: '',
      });
      
      // Перенаправляем на страницу созданного турнира через 2 секунды
      setTimeout(() => {
        navigate(`/tournament/${response.id}`);
      }, 2000);
    } catch (err: any) {
      console.error('Ошибка при создании турнира:', err);
      setError(err.message || 'Произошла ошибка при создании турнира');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBusinessTournament = () => {
    setIsBusinessTournament(!isBusinessTournament);
  };

  return (
    <div className="create-tournament-page">
      <div className="container">
        <div className="create-tournament-header">
          <h1>Создание нового турнира</h1>
          <p>Заполните форму ниже для создания нового турнира FIBA 3x3</p>
        </div>

        <div className="create-tournament-form-container">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <form onSubmit={handleSubmit} className="create-tournament-form">
            <div className="form-section">
              <h2>Основная информация</h2>
              
              <div className="form-group">
                <label htmlFor="name">
                  <FontAwesomeIcon icon={faTrophy} /> Название турнира*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Введите название турнира"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="date">
                  <FontAwesomeIcon icon={faCalendarAlt} /> Дата проведения*
                </label>
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
                <label htmlFor="location">
                  <FontAwesomeIcon icon={faMapMarkerAlt} /> Место проведения*
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Укажите место проведения"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="level">Уровень турнира*</label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  required
                >
                  <option value="amateur">Любительский</option>
                  <option value="professional">Профессиональный</option>
                  <option value="international">Международный</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="prize_pool">
                  <FontAwesomeIcon icon={faMoneyBillWave} /> Призовой фонд (₽)
                </label>
                <input
                  type="number"
                  id="prize_pool"
                  name="prize_pool"
                  value={formData.prize_pool}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>
            
            <div className="form-section">
              <h2>Дополнительная информация</h2>
              
              <div className="form-group">
                <label htmlFor="description">Описание турнира</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Добавьте описание турнира"
                  rows={5}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="image_url">URL изображения</label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="Добавьте ссылку на изображение"
                />
              </div>
            </div>
            
            <div className="form-section">
              <div className="business-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={isBusinessTournament}
                    onChange={toggleBusinessTournament}
                  />
                  <span className="toggle-text">Это бизнес-турнир</span>
                </label>
              </div>
              
              {isBusinessTournament && (
                <div className="business-fields">
                  <h2>
                    <FontAwesomeIcon icon={faBuilding} /> Информация о спонсоре
                  </h2>
                  
                  <div className="form-group">
                    <label htmlFor="sponsor_name">Название компании-спонсора*</label>
                    <input
                      type="text"
                      id="sponsor_name"
                      name="sponsor_name"
                      value={formData.sponsor_name}
                      onChange={handleChange}
                      placeholder="Название компании"
                      required={isBusinessTournament}
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
                      placeholder="Добавьте ссылку на логотип"
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
                      placeholder="Например: Розничная торговля, IT, Спорт"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/tournaments')}>
                Отмена
              </button>
              <button type="submit" className="btn-create" disabled={isLoading}>
                {isLoading ? 'Создание...' : 'Создать турнир'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTournament; 