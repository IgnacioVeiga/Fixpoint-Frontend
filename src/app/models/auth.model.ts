export interface LoginRequest {
  username: string;
  password: string;
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
