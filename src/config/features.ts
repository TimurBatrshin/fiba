import { featureFlagService, FeatureFlags } from '../services/FeatureFlagService';

// Дефолтные значения фичей
const defaultFeatures: FeatureFlags = {
  disableBackend: false,
  showTopPlayers: true,
  showAdminPanel: true,
  enableAdminPage: true,
  enableTournamentFilter: true,
  enablePlayerSearch: true,
  experimentalRegistration: false,
};

// Текущие значения фичей
export let features: FeatureFlags = { ...defaultFeatures };

// Функция для обновления значений фичей
export const updateFeatures = async () => {
  try {
    const updatedFeatures = await featureFlagService.getFeatureFlags();
    features = { ...updatedFeatures };
  } catch (error) {
    console.error('Failed to update features:', error);
    // В случае ошибки используем дефолтные значения
    features = { ...defaultFeatures };
  }
};

// Инициализируем значения при загрузке приложения
updateFeatures(); 