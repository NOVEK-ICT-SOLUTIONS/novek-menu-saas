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
  location: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  primaryColor: string | null;
  backgroundColor: string | null;
  logoUrl: string | null;
  headerImageUrl: string | null;
  qrCodeUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestaurantWithCategories extends RestaurantResponse {
  categories: {
    id: string;
    name: string;
    description: string | null;
    sortOrder: number;
    isActive: boolean;
    items: {
      id: string;
      name: string;
      description: string | null;
      price: number;
      imageUrl: string | null;
      isAvailable: boolean;
    }[];
  }[];
}

export interface OwnerStats {
  restaurants: number;
  categories: number;
  menuItems: number;
  qrScans: number;
}
