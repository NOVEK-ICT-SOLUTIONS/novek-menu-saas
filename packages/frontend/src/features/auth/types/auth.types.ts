export interface User {
  id: string;
  email: string;
  role: "OWNER" | "ADMIN" | "CUSTOMER";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: "success";
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}
