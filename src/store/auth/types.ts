import type { JwtPayload } from 'jwt-decode'

export interface AuthState {
  authenticated: boolean;
  token: JwtPayload | null;
  tokenString: string | null; // Raw JWT token string for WebSocket identify
  refresh_token: JwtPayload | null;
  refreshTokenString: string | null; // Raw refresh token string
  currentUser: AppUser | null;
  users: AppUser[];
  apiKey: string;
}

export interface AppUser {
  username: string;
  password?: string;
  source: string;
  created_on?: number;
}
