import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import "./Ad.css";

interface AdFormData {
  title: string;
  imageUrl: string;
  tournamentId: string;
  description: string;
  expirationDate: string;
  sponsorName: string;
}

interface AdResponse {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
}

const Ad: React.FC = () => {
  const [formData, setFormData] = useState<AdFormData>({
    title: '',
    imageUrl: '',
    tournamentId: '',
    description: '',
    expirationDate: '',
    sponsorName: ''
  });
  const [errors, setErrors] = useState<Partial<AdFormData>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user types
    if (errors[name as keyof AdFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AdFormData> = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
      isValid = false;
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'URL изображения обязателен';
      isValid = false;
    } else if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.imageUrl)) {
      newErrors.imageUrl = 'Неверный формат URL изображения';
      isValid = false;
    }

    if (!formData.tournamentId.trim()) {
      newErrors.tournamentId = 'ID турнира обязателен';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
      isValid = false;
    }

    if (!formData.sponsorName.trim()) {
      newErrors.sponsorName = 'Имя спонсора обязательно';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      tournamentId: '',
      description: '',
      expirationDate: '',
      sponsorName: ''
    });
    setErrors({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post<AdResponse>('/api/ads', {
        title: formData.title,
        image_url: formData.imageUrl,
        tournament_id: formData.tournamentId,
        description: formData.description,
        expiration_date: formData.expirationDate,
        sponsor_name: formData.sponsorName
      }, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      setSubmitStatus({
        success: true,
        message: 'Рекламное предложение успешно отправлено и ожидает одобрения'
      });
      resetForm();
    } catch (error) {
      console.error('Error submitting ad proposal:', error);
      setSubmitStatus({
        success: false,
        message: 'Произошла ошибка при отправке рекламного предложения. Пожалуйста, попробуйте позже.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ad-proposal-container">
      <h2 className="ad-title">Размещение рекламы для бизнеса</h2>
      <p className="ad-description">
        Заполните форму для размещения вашего бренда на страницах турниров и в уведомлениях участникам.
      </p>
      
      {submitStatus && (
        <div className={`status-message ${submitStatus.success ? 'success' : 'error'}`}>
          {submitStatus.message}
        </div>
      )}
      
      <form className="ad-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Название рекламной кампании</label>
          <input 
            type="text" 
            id="title"
            name="title"
            value={formData.title} 
            onChange={handleChange} 
            placeholder="Название рекламной кампании" 
            className={errors.title ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="sponsorName">Название компании-спонсора</label>
          <input 
            type="text" 
            id="sponsorName"
            name="sponsorName"
            value={formData.sponsorName} 
            onChange={handleChange} 
            placeholder="Название вашей компании" 
            className={errors.sponsorName ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.sponsorName && <span className="error-text">{errors.sponsorName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">URL логотипа или баннера</label>
          <input 
            type="text" 
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl} 
            onChange={handleChange} 
            placeholder="https://example.com/image.jpg" 
            className={errors.imageUrl ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.imageUrl && <span className="error-text">{errors.imageUrl}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Описание рекламного предложения</label>
          <textarea 
            id="description"
            name="description"
            value={formData.description} 
            onChange={handleChange} 
            placeholder="Подробное описание рекламного предложения..." 
            className={errors.description ? 'error' : ''}
            disabled={isLoading}
            rows={4}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="tournamentId">ID турнира</label>
          <input 
            type="text" 
            id="tournamentId"
            name="tournamentId"
            value={formData.tournamentId} 
            onChange={handleChange} 
            placeholder="Идентификатор турнира для рекламы" 
            className={errors.tournamentId ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.tournamentId && <span className="error-text">{errors.tournamentId}</span>}
          <span className="hint-text">Оставьте поле пустым, если хотите разместить рекламу на всех турнирах</span>
        </div>
        
        <div className="form-group">
          <label htmlFor="expirationDate">Дата окончания кампании</label>
          <input 
            type="date" 
            id="expirationDate"
            name="expirationDate"
            value={formData.expirationDate} 
            onChange={handleChange} 
            min={new Date().toISOString().split('T')[0]}
            disabled={isLoading}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={resetForm} 
            className="btn-secondary"
            disabled={isLoading}
          >
            Очистить
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Отправка...' : 'Отправить рекламное предложение'}
          </button>
        </div>
      </form>
      
      <div className="ad-info-block">
        <h3>Преимущества размещения рекламы</h3>
        <ul>
          <li>Доступ к целевой аудитории игроков и болельщиков стритбола</li>
          <li>Брендинг на страницах турниров и в push-уведомлениях</li>
          <li>Аналитика просмотров и вовлеченности</li>
          <li>Возможность спонсорства конкретных турниров</li>
        </ul>
      </div>
    </div>
  );
};

export default Ad;