export interface User {
  id: number;
  name: string;
  email: string;
  profile: {
    photo_url?: string;
  };
} 