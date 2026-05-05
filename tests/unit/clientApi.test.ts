import {
  apiRequest,
  cacheCurrentUser,
  clearAccessToken,
  getCachedCurrentUser,
  getCurrentUser,
  requestPhoneOtp,
  setAccessToken,
  verifyPhoneOtp,
} from "@/lib/clientApi";

const jsonResponse = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: async () => body,
  }) as Response;

describe("client api helpers", () => {
  beforeEach(() => {
    window.localStorage.clear();
    cacheCurrentUser(null);
  });

  it("adds bearer token to authenticated requests", async () => {
    setAccessToken("token-123");
    global.fetch = jest.fn(async () => jsonResponse({ ok: true })) as jest.Mock;

    await apiRequest("/products");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/products"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
        }),
      }),
    );
  });

  it("clears saved access token on logout", () => {
    setAccessToken("token-123");
    cacheCurrentUser({ id: "user-1", name: "Cached User" });
    clearAccessToken();

    expect(window.localStorage.getItem("cheaperAccessToken")).toBeNull();
    expect(getCachedCurrentUser()).toBeNull();
  });

  it("requests and verifies phone OTP login", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ phone: "+1555", otp: "123456" }))
      .mockResolvedValueOnce(jsonResponse({ accessToken: "jwt-token" }));

    await requestPhoneOtp("+1555");
    await verifyPhoneOtp("+1555", "123456");

    expect(window.localStorage.getItem("cheaperAccessToken")).toBe("jwt-token");
  });

  it("caches the current user after fetching auth profile", async () => {
    setAccessToken("token-123");
    global.fetch = jest.fn(async () =>
      jsonResponse({ id: "user-1", name: "Fresh User" }),
    ) as jest.Mock;

    await expect(getCurrentUser()).resolves.toEqual({
      id: "user-1",
      name: "Fresh User",
    });

    expect(getCachedCurrentUser()).toEqual({
      id: "user-1",
      name: "Fresh User",
    });
  });

  it("uses current browser host for API calls on mobile or LAN", async () => {
    Object.defineProperty(window, "location", {
      value: { hostname: "10.0.0.8" },
      configurable: true,
    });
    global.fetch = jest.fn(async () => jsonResponse({ ok: true })) as jest.Mock;

    await apiRequest("/auth/me");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://10.0.0.8:3001/auth/me",
      expect.any(Object),
    );
  });
});
