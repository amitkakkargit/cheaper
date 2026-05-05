import { getConfiguredApiBaseUrl } from "@/lib/apiBaseUrl";
import type {
  CreateSupportTicketInput,
  SupportTicketResponse,
  TransactionStatus,
} from "@/lib/types";

const TOKEN_KEY = "cheaperAccessToken";
const USER_CACHE_KEY = "cheaperCurrentUser";

export interface CurrentUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  sellers?: Array<{ id: string }>;
}

let cachedCurrentUser: CurrentUser | null = null;

export function getCachedCurrentUser() {
  if (cachedCurrentUser) return cachedCurrentUser;
  if (typeof window === "undefined") return null;

  const savedUser = window.localStorage.getItem(USER_CACHE_KEY);
  if (!savedUser) return null;

  try {
    cachedCurrentUser = JSON.parse(savedUser) as CurrentUser;
    return cachedCurrentUser;
  } catch {
    window.localStorage.removeItem(USER_CACHE_KEY);
    return null;
  }
}

export function cacheCurrentUser(user: CurrentUser | null) {
  cachedCurrentUser = user;
  if (typeof window === "undefined") return;

  if (user) {
    window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(USER_CACHE_KEY);
  }
}

export function getAccessToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TOKEN_KEY) ?? "";
}

export function setAccessToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  cacheCurrentUser(null);
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${getConfiguredApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function requestPhoneOtp(phone: string) {
  return apiRequest<{ phone: string; otp: string; expiresInSeconds: number }>("/auth/phone/request-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export async function verifyPhoneOtp(phone: string, otp: string) {
  const result = await apiRequest<{ accessToken: string }>("/auth/phone/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp }),
  });
  setAccessToken(result.accessToken);
  return result.accessToken;
}

export async function requestEmailOtp(email: string) {
  return apiRequest<{ email: string; otp: string; expiresInSeconds: number }>("/auth/email/request-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmailOtp(email: string, otp: string) {
  const result = await apiRequest<{ accessToken: string }>("/auth/email/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
  setAccessToken(result.accessToken);
  return result.accessToken;
}

export async function getCurrentUser() {
  if (!getAccessToken()) {
    cacheCurrentUser(null);
    return null;
  }

  try {
    const currentUser = await apiRequest<CurrentUser>("/auth/me");
    cacheCurrentUser(currentUser);
    return currentUser;
  } catch {
    cacheCurrentUser(null);
    return null;
  }
}

export async function updateProfile(data: { name?: string; avatarUrl?: string }) {
  const updatedUser = await apiRequest<CurrentUser>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  cacheCurrentUser(updatedUser);
  return updatedUser;
}

export async function getTransactionStatus(productId: string) {
  return apiRequest<TransactionStatus>(
    `/products/${encodeURIComponent(productId)}/transaction-status`,
  );
}

export async function markProductSold(productId: string) {
  return apiRequest("/products/mark-sold", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

export async function markProductReceived(productId: string) {
  return apiRequest("/products/mark-received", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

export async function createProductReview(data: {
  productId: string;
  sellerId: string;
  rating: number;
  comment?: string;
}) {
  return apiRequest("/product-reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createSellerReview(data: {
  productId: string;
  sellerId: string;
  rating: number;
  comment?: string;
}) {
  return apiRequest("/seller-reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createBuyerReview(data: {
  productId: string;
  buyerId: string;
  rating: number;
  comment?: string;
}) {
  return apiRequest("/buyer-reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createSupportTicket(data: CreateSupportTicketInput) {
  return apiRequest<SupportTicketResponse>("/support-tickets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
