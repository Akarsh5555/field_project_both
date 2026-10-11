export type UserRole = 'System Admin' | 'Sales Manager' | 'Sales Representative';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  territory?: string;
  region?: string;
  repId?: string; // Associated SalesRep ID if role is Sales Representative
  phone?: string;
  department: string;
  permissions: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number; // seconds
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  territory?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
