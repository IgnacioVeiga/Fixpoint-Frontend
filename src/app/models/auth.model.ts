export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthTokenResponse {
  tokenType: string;
  accessToken: string;
  expiresAt: string;
  username: string;
  role: string;
}

export interface AuthSession {
  tokenType: string;
  accessToken: string;
  expiresAt: string;
  username: string;
  role: string;
}
