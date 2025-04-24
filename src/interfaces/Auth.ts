export interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'business';
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'business';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin' | 'business';
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'business';
}

export interface DecodedToken {
  sub: string; // user ID
  role: 'user' | 'admin' | 'business';
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
  name?: string; // имя пользователя (необязательное)
  email?: string; // email пользователя (необязательное)
}

export interface UserProfile {
  id: number;
  user_id: number;
  name: string;
  email: string;
  photo_url: string;
  tournaments_played: number;
  total_points: number;
  rating: number;
} 