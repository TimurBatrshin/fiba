export interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  profile?: {
    photo_url?: string;
    tournaments_played?: number;
    total_points?: number;
    rating?: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  name: string;
  role: UserRole;
}

export type UserRole = 'user' | 'admin' | 'business';

export interface DecodedToken {
  // Стандартные поля JWT
  iss?: string;        // Issuer
  sub?: string;        // Subject (обычно user ID)
  aud?: string[];      // Audience
  exp: number;         // Expiration time
  nbf?: number;        // Not before
  iat?: number;        // Issued at
  jti?: string;        // JWT ID
  
  // Кастомные поля
  userId?: string;     // ID пользователя
  email?: string;      // Email пользователя
  role?: string;       // Роль пользователя
}

export interface TokenValidationResult {
  isValid: boolean;
  error?: string;
  decodedToken?: DecodedToken;
}

export interface UserProfile extends User {
  email_verified: boolean;
  profile: {
    tournaments_played: number;
    total_points: number;
    rating: number;
    photo_url?: string;
  };
} 