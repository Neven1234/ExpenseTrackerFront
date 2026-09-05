export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  username: string;
  token: string;
  expiresAtUtc: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  username: string;
  token: string;
  expiresAtUtc: string;
}
