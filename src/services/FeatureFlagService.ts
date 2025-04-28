import { BaseApiService } from './BaseApiService';
import { ApiResponse } from './BaseApiService';

export interface FeatureFlags {
  disableBackend: boolean;
  showTopPlayers: boolean;
  showAdminPanel: boolean;
  enableAdminPage: boolean;
  enableTournamentFilter: boolean;
  enablePlayerSearch: boolean;
  experimentalRegistration: boolean;
}

class FeatureFlagService extends BaseApiService {
  private static instance: FeatureFlagService;
  private featureFlags: FeatureFlags | null = null;

  private constructor() {
    super();
  }

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  public async getFeatureFlags(): Promise<FeatureFlags> {
    try {
      if (!this.featureFlags) {
        const response = await this.get<ApiResponse<FeatureFlags>>('/features');
        this.featureFlags = response.data;
      }
      return this.featureFlags as FeatureFlags;
    } catch (error) {
      console.error('Failed to fetch feature flags:', error);
      // Возвращаем дефолтные значения в случае ошибки
      return {
        disableBackend: false,
        showTopPlayers: true,
        showAdminPanel: true,
        enableAdminPage: true,
        enableTournamentFilter: true,
        enablePlayerSearch: true,
        experimentalRegistration: false
      };
    }
  }

  public async updateFeatureFlags(flags: Partial<FeatureFlags>): Promise<FeatureFlags> {
    const response = await this.put<ApiResponse<FeatureFlags>>('/features', flags);
    this.featureFlags = response.data;
    return this.featureFlags;
  }

  public clearCache(): void {
    this.featureFlags = null;
  }
}

export const featureFlagService = FeatureFlagService.getInstance(); 