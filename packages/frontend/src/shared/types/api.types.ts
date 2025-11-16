export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
  message?: string;
}

export interface ApiError {
  status: "error";
  message: string;
  errors?: Record<string, string[]>;
}
