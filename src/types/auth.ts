export interface DecodedToken {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'business';
  exp: number;
  iat: number;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'business';
  firstName?: string;
  lastName?: string;
  phone?: string;
} 