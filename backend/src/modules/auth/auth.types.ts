export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
  };
}