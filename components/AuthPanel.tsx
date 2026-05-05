"use client";

import { useEffect, useState } from "react";
import {
  clearAccessToken,
  getCurrentUser,
  requestEmailOtp,
  requestPhoneOtp,
  updateProfile,
  verifyEmailOtp,
  verifyPhoneOtp,
  type CurrentUser,
} from "@/lib/clientApi";
import FormNotification, { type NotificationState } from "./FormNotification";

type LoginMode = "phone" | "email";

export default function AuthPanel() {
  const [mode, setMode] = useState<LoginMode>("phone");
  const [target, setTarget] = useState("");
  const [otp, setOtp] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [notification, setNotification] = useState<NotificationState>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setName(currentUser?.name ?? "");
      setAvatarUrl(currentUser?.avatarUrl ?? "");
    });
  }, []);

  const secondsLeft = expiresAt
    ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
    : 0;

  const requestOtp = async () => {
    try {
      const response =
        mode === "phone"
          ? await requestPhoneOtp(target)
          : await requestEmailOtp(target);
      setExpiresAt(Date.now() + response.expiresInSeconds * 1000);
      setOtp(response.otp);
      setNotification({
        type: "success",
        message: `OTP sent. Dev OTP: ${response.otp}`,
      });
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to request OTP",
      });
    }
  };

  const verifyOtp = async () => {
    try {
      if (mode === "phone") {
        await verifyPhoneOtp(target, otp);
      } else {
        await verifyEmailOtp(target, otp);
      }
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setName(currentUser?.name ?? "");
      setAvatarUrl(currentUser?.avatarUrl ?? "");
      setNotification({ type: "success", message: "Logged in." });
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Login failed",
      });
    }
  };

  const saveProfile = async () => {
    try {
      const updatedUser = await updateProfile({
        name: name || undefined,
        avatarUrl: avatarUrl || undefined,
      });
      setUser(updatedUser);
      setNotification({ type: "success", message: "Profile updated." });
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Profile update failed",
      });
    }
  };

  const logout = () => {
    clearAccessToken();
    setUser(null);
    setName("");
    setAvatarUrl("");
    setOtp("");
    setExpiresAt(null);
    setNotification({
      type: "success",
      message: "Logged out. You can sign in with a different email or phone.",
    });
  };

  const avatarText =
    user?.name?.charAt(0) || user?.email?.charAt(0) || user?.phone?.slice(-2) || "?";

  return (
    <div className="info-card">
      <div className="section-header-row">
        <div>
          <h3>{user ? "Account" : "Sign in"}</h3>
          <p className="muted-text">
            {user
              ? "Manage your public profile and local marketplace account."
              : "Login with email or phone OTP. OTP is valid for 60 seconds."}
          </p>
        </div>
        {user ? (
          <div className="avatar-icon" aria-label="Logged in user">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" />
            ) : (
              <span>{avatarText.toUpperCase()}</span>
            )}
          </div>
        ) : null}
      </div>

      {!user ? (
        <>
          <div className="header-actions">
            <button
              type="button"
              className={`secondary-button ${mode === "phone" ? "active" : ""}`}
              onClick={() => setMode("phone")}
            >
              Phone
            </button>
            <button
              type="button"
              className={`secondary-button ${mode === "email" ? "active" : ""}`}
              onClick={() => setMode("email")}
            >
              Email
            </button>
          </div>
          <div className="field-row">
            <label className="field-label">
              {mode === "phone" ? "Phone" : "Email"}
              <input
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                placeholder={mode === "phone" ? "+15550009999" : "you@example.com"}
                aria-label={mode === "phone" ? "Phone" : "Email"}
              />
            </label>
            <button type="button" className="secondary-button" onClick={requestOtp}>
              Send OTP
            </button>
          </div>
          <div className="field-row">
            <label className="field-label">
              OTP
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                aria-label="OTP"
              />
            </label>
            <button
              type="button"
              className="primary-button"
              onClick={verifyOtp}
              disabled={!expiresAt || secondsLeft <= 0}
            >
              Verify OTP
            </button>
          </div>
          {expiresAt ? (
            <p className="status-text">
              {secondsLeft > 0 ? `${secondsLeft}s remaining` : "OTP expired"}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <p className="status-text">
            Restored saved session for {user.phone || user.email || user.id}
          </p>
          <div className="field-row">
            <label className="field-label">
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="field-label">
              Avatar URL
              <input
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
              />
            </label>
          </div>
          <div className="header-actions">
            <button type="button" className="secondary-button" onClick={saveProfile}>
              Save profile
            </button>
            <button type="button" className="secondary-button" onClick={logout}>
              Log out
            </button>
          </div>
        </>
      )}
      <FormNotification notification={notification} />
    </div>
  );
}
