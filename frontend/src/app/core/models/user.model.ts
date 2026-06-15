export type UserRole = 'STUDENT' | 'ADMIN';

export interface AuthUser {
  username: string;
  role: UserRole;
  fullName: string;
  token?: string;
  mustChangePassword?: boolean; // student must set a new password before using the portal
}

export interface LoginRequest {
  username: string;
  password: string;
  role: UserRole;
}