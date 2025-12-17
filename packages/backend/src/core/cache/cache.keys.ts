export const CacheKeys = {
  publicMenu: (slug: string) => `public:menu:${slug}`,
  ownerRestaurants: (userId: string) => `owner:${userId}:restaurants`,
  restaurantCategories: (restaurantId: string) => `restaurant:${restaurantId}:categories`,
  categoryItems: (categoryId: string) => `category:${categoryId}:items`,
  adminStats: () => "admin:stats",
  userSession: (userId: string) => `user:${userId}:session`,
} as const;

const FIVE_MINUTES_SECONDS = 5 * 60;
const TWO_MINUTES_SECONDS = 2 * 60;
const FIFTEEN_MINUTES_SECONDS = 15 * 60;

export const CacheTTL = {
  PUBLIC_MENU: FIVE_MINUTES_SECONDS,
  OWNER_DATA: TWO_MINUTES_SECONDS,
  ADMIN_STATS: FIVE_MINUTES_SECONDS,
  USER_SESSION: FIFTEEN_MINUTES_SECONDS,
} as const;
