import axios from 'axios';
import { API_BASE_URL } from '../../config/envConfig';

// Типы данных
export interface AdResult {
  id: string;
  adId: string;
  clicks: number;
  views: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessTournament {
  title: string;
  date: string;
  location: string;
  level: string;
  prize_pool: number;
  sponsor_name: string;
  sponsor_logo: string;
  business_type: string;
}

export interface Ad {
  id: string;
  title: string;
  imageUrl?: string;
  tournamentId?: string;
  tournamentTitle?: string;
  status?: string;
}

// Получение результатов рекламы
export const getAdResults = async (): Promise<AdResult[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Ошибка: отсутствует токен авторизации");
      throw new Error('Необходима авторизация');
    }

    const response = await axios.get(`${API_BASE_URL}/ad-results`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении результатов рекламы", error);
    
    // В случае 500 ошибки, попробуем получить результаты через альтернативный эндпоинт
    if (error.response && error.response.status === 500) {
      try {
        console.log("Пробуем получить результаты через альтернативный эндпоинт...");
        const token = localStorage.getItem('token');
        
        // Пробуем получить список рекламы
        const adsResponse = await axios.get(`${API_BASE_URL}/ads`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Если успешно получили список рекламы, создаем массив результатов
        if (adsResponse.data && Array.isArray(adsResponse.data)) {
          console.log("Получены результаты через альтернативный эндпоинт:", adsResponse.data);
          
          // Преобразуем данные о рекламе в формат результатов рекламы
          return adsResponse.data.map(ad => ({
            id: `${ad.id}-result`,
            adId: ad.id,
            clicks: ad.clicks || 0,
            views: ad.views || 0,
            createdAt: ad.created_at || new Date().toISOString(),
            updatedAt: ad.updated_at || new Date().toISOString()
          }));
        }
      } catch (altError) {
        console.error("Ошибка при получении результатов через альтернативный эндпоинт:", altError);
      }
    }
    
    // Если все попытки неудачны, возвращаем пустой массив
    return [];
  }
};

// Получение рекламы бизнеса
export const getBusinessAds = async (): Promise<Ad[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Ошибка: отсутствует токен авторизации");
      throw new Error('Необходима авторизация');
    }

    const response = await axios.get(`${API_BASE_URL}/ads`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении рекламы", error);
    return [];
  }
};

// Создание новой рекламы
export const createAd = async (adData: { 
  title: string; 
  tournamentId?: string;
}): Promise<Ad> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Необходима авторизация');
    }

    const response = await axios.post(
      `${API_BASE_URL}/ads`, 
      adData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Ошибка при создании рекламы:", error);
    throw error;
  }
};

// Получение бизнес-турниров
export const getBusinessTournaments = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Необходима авторизация');
    }

    const response = await axios.get(`${API_BASE_URL}/tournaments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении турниров:", error);
    return [];
  }
}; 