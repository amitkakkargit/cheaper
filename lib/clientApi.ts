import { getConfiguredApiBaseUrl } from "@/lib/apiBaseUrl";
import type {
  CreateSupportTicketInput,
  SupportTicketResponse,
  TransactionStatus,
} from "@/lib/types";

const TOKEN_KEY = "cheaperAccessToken";

export interface CurrentUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  sellers?: Array<{ id: string }>;
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
    return null;
  }

  try {
    return await apiRequest<CurrentUser>("/auth/me");
  } catch {
    return null;
  }
}

export async function updateProfile(data: { name?: string; avatarUrl?: string }) {
  return apiRequest<CurrentUser>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
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
