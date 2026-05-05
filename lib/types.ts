export type ConditionType = 'New' | 'Second-hand' | 'Used' | 'Refurbished';

export interface Product {
  id: string;
  name?: string;
  title: string;
  description: string;
  imageUrl: string;
  images: string[];
  videoUrl: string;
  videoStory: string;
  currentPrice: number;
  previousPrice: number;
  discountPercentage: number;
  condition: ConditionType;
  location: string;
  category: string;
  sellerId: string;
  latitude?: number;
  longitude?: number;
  purchases?: Purchase[];
}

export interface Seller {
  id: string;
  userId?: string;
  name: string;
  location: string;
  bio: string;
  avatarUrl: string;
  latitude?: number;
  longitude?: number;
  products?: Product[];
  reviews?: ApiReview[];
}

export interface Rating {
  id: string;
  targetId: string;
  score: number;
  review: string;
}

export interface ProductWithSeller extends Product {
  sellerName: string;
  sellerLocation: string;
  sellerAvatarUrl: string;
  productRatingCount: number;
  productRatingAverage: number;
  sellerRatingCount: number;
  sellerRatingAverage: number;
}

export interface ApiReview {
  id: string;
  userId: string;
  sellerId?: string;
  productId?: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
}

export interface Purchase {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  buyerConfirmedAt?: string | null;
  sellerConfirmedAt?: string | null;
}
