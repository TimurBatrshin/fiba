export interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'COACH' | 'ORGANIZER';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'COACH' | 'ORGANIZER';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'COACH' | 'ORGANIZER';
}

export interface DecodedToken {
  sub: string;
  role: 'ADMIN' | 'USER' | 'COACH' | 'ORGANIZER';
  exp: number;
  iat: number;
}

export interface UserProfile {
  id: string;
  userId: string;
  photoUrl?: string;
  avatarUrl?: string;
  bio?: string;
  phoneNumber?: string;
  city?: string;
  age?: number;
  tournamentsPlayed?: number;
  totalPoints?: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
} 