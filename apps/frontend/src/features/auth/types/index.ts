export interface User {
  uid: string; // Firebase uses uid instead of id
  email: string; // Firebase uses email instead of username
  name?: string;
  createdAt?: string;
}

export interface LoginRequest {
  email: string; // Changed from username to email
  password: string;
}

export interface RegisterRequest {
  email: string; // Changed from username to email
  password: string;
  name?: string;
}

export interface ForgotPasswordRequest {
  email: string; // Changed from username to email
}

export interface AuthResponse {
  user: User;
  message?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
