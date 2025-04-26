import axios from 'axios';
import { API_BASE_URL } from '../../config/envConfig';
import { getStoredToken } from '../../utils/tokenStorage';
import { AdminStats, AdminUser } from '../../interfaces/Admin';

// Admin API service for managing resources in the admin panel

// Types
export interface AdminStats {
  total_users: number;
  total_tournaments: number;
  active_tournaments: number;
  pending_registrations: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  created_at: string;
}

export interface AdminTournament {
  id: string;
  title: string;
  date: string;
  status: 'registration' | 'in_progress' | 'completed';
  registrations_count: number;
}

export interface AdminAd {
  id: string;
  title: string;
  imageUrl: string;
  tournament_id?: string;
  tournament_name?: string;
  advertiser_id?: string;
  advertiser_name?: string;
  business_id?: string;
  business_name?: string;
  clicks: number;
  views: number;
  created_at: string;
}

// Get admin dashboard statistics
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// Get all users for admin management
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
};

// Update user role
export const updateUserRole = async (userId: string, role: string): Promise<AdminUser> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.put(
      `${API_BASE_URL}/admin/users/${userId}/role`,
      { role },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Get all tournaments for admin management
export const getAdminTournaments = async (): Promise<AdminTournament[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_BASE_URL}/admin/tournaments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching admin tournaments:', error);
    throw error;
  }
};

// Update tournament status
export const updateTournamentStatus = async (tournamentId: string, status: 'registration' | 'in_progress' | 'completed'): Promise<AdminTournament> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.put(
      `${API_BASE_URL}/admin/tournaments/${tournamentId}/status`,
      { status },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating tournament status:', error);
    throw error;
  }
};

// Get all ads for admin management
export const getAdminAds = async (): Promise<AdminAd[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_BASE_URL}/admin/ads`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching admin ads:', error);
    throw error;
  }
};

// Delete ad
export const deleteAd = async (adId: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    await axios.delete(`${API_BASE_URL}/admin/ads/${adId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error deleting ad:', error);
    throw error;
  }
}; 