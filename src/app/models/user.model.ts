export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}