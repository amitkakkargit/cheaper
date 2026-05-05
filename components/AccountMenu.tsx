"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
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

export default function AccountMenu() {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<LoginMode>("phone");
  const [target, setTarget] = useState("");
  const [otp, setOtp] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
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

  useEffect(() => {
    if (!expiresAt) return;

    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    if (!isOpen) return;

    const closeWhenOutside = (event: MouseEvent | FocusEvent) => {
      const targetNode = event.target;

      if (
        targetNode instanceof Node &&
        menuRef.current &&
        !menuRef.current.contains(targetNode)
      ) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeWhenOutside);
    document.addEventListener("focusin", closeWhenOutside);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeWhenOutside);
      document.removeEventListener("focusin", closeWhenOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const secondsLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt - now) / 1000)) : 0;
  const avatarText =
    user?.name?.charAt(0) || user?.email?.charAt(0) || user?.phone?.slice(-2) || "?";

  const requestOtp = async () => {
    try {
      const response =
        mode === "phone"
          ? await requestPhoneOtp(target)
          : await requestEmailOtp(target);
      setExpiresAt(Date.now() + response.expiresInSeconds * 1000);
      setNow(Date.now());
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

  const selectAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotification({
        type: "error",
        message: "Please select an image file.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        type: "error",
        message: "Please select an image smaller than 5 MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        return;
      }

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 160;
        const scale = Math.max(size / image.width, size / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        const offsetX = (size - width) / 2;
        const offsetY = (size - height) / 2;
        const context = canvas.getContext("2d");

        canvas.width = size;
        canvas.height = size;
        context?.drawImage(image, offsetX, offsetY, width, height);

        setAvatarUrl(canvas.toDataURL("image/jpeg", 0.82));
        setNotification({
          type: "success",
          message: "Avatar selected. Save profile to keep it.",
        });
      };
      image.onerror = () => {
        setNotification({
          type: "error",
          message: "Unable to load avatar image.",
        });
      };
      image.src = reader.result;
    };
    reader.onerror = () => {
      setNotification({
        type: "error",
        message: "Unable to read avatar image.",
      });
    };
    reader.readAsDataURL(file);
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

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        type="button"
        className={user ? "avatar-icon account-trigger" : "secondary-button account-trigger"}
        aria-label={user ? "Open account settings" : "Sign in"}
        onClick={() => setIsOpen((open) => !open)}
      >
        {user ? (
          user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" />
          ) : (
            <span>{avatarText.toUpperCase()}</span>
          )
        ) : (
          "Sign in"
        )}
      </button>

      {isOpen ? (
        <div className="account-popover">
          <div>
            <h2>{user ? "Profile settings" : "Sign in"}</h2>
            <p className="muted-text">
              {user
                ? "Update your public marketplace profile."
                : "Login with email or phone OTP. OTP is valid for 60 seconds."}
            </p>
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
              {expiresAt ? (
                <p className="status-text">
                  {secondsLeft > 0 ? `${secondsLeft}s remaining` : "OTP expired"}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="status-text">
                Signed in as {user.phone || user.email || user.id}
              </p>
              <label className="field-label">
                Name
                <input value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <div className="avatar-picker">
                <div className="avatar-icon avatar-preview" aria-label="Selected avatar preview">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" />
                  ) : (
                    <span>{avatarText.toUpperCase()}</span>
                  )}
                </div>
                <label className="secondary-button avatar-upload-button">
                  Select avatar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={selectAvatar}
                    aria-label="Select avatar image"
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
      ) : null}
    </div>
  );
}
