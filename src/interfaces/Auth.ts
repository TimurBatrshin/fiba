export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  teams?: Array<{
    name: string;
    role: string;
  }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    photoUrl?: string;
  };
}

export interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
  iat: number;
} 