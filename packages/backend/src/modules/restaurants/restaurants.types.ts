export interface CreateRestaurantRequest {
  name: string;
  slug: string;
}

export interface UpdateRestaurantRequest {
  name?: string;
  slug?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  primaryColor?: string;
  backgroundColor?: string;
  logoUrl?: string;
  headerImageUrl?: string;
}

export interface RestaurantResponse {
  id: string;
  name: string;
  slug: string;
  qrCodeUrl: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
