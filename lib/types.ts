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
  sellerMarkedSoldAt?: string | null;
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

export interface TransactionStatus {
  productId: string;
  isSellerOwner: boolean;
  sellerMarkedSold: boolean;
  sellerMarkedSoldAt?: string | null;
  buyerConfirmed: boolean;
  buyerConfirmedAt?: string | null;
  buyerIdForSellerReview?: string | null;
  canMarkSold: boolean;
  canMarkReceived: boolean;
  canBuyerReviewSeller: boolean;
  canBuyerReviewProduct: boolean;
  canSellerReviewBuyer: boolean;
  message: string;
}

export type SupportTicketCategory =
  | "Login issue"
  | "Payment issue"
  | "Product issue"
  | "Seller issue"
  | "App bug"
  | "Account issue"
  | "Delivery issue"
  | "Other";

export interface CreateSupportTicketInput {
  subject: string;
  description: string;
  category: SupportTicketCategory;
  email?: string;
  source: "web" | "mobile";
  deviceInfo?: string;
  appVersion?: string;
  screenshotUrl?: string;
  productId?: string;
}

export interface SupportTicketResponse {
  id: string;
  status: string;
  createdAt: string;
  message: string;
}
