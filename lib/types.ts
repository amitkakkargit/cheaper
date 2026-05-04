export type ConditionType = 'New' | 'Second-hand' | 'Used' | 'Refurbished';

export interface Product {
  id: string;
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
}

export interface Seller {
  id: string;
  name: string;
  location: string;
  bio: string;
  avatarUrl: string;
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
