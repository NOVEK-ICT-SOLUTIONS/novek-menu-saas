export interface CreateMenuRequest {
  name: string;
  isActive?: boolean;
}

export interface UpdateMenuRequest {
  name?: string;
  isActive?: boolean;
}
