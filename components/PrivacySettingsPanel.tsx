"use client";

import { useMemo, useState } from "react";
import FormNotification, { type NotificationState } from "./FormNotification";

interface PrivacySetting {
  id: keyof PrivacySettingsState;
  title: string;
  description: string;
}

interface PrivacySettingsState {
  profileVisible: boolean;
  showSellerRatings: boolean;
  showSoldProducts: boolean;
  preciseLocation: boolean;
  allowDirectMessages: boolean;
  personalizedRecommendations: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

const settings: PrivacySetting[] = [
  {
    id: "profileVisible",
    title: "Public profile",
    description: "Allow buyers and sellers to view your marketplace profile.",
  },
  {
    id: "showSellerRatings",
    title: "Show seller ratings publicly",
    description: "Display your seller rating summary on public seller pages.",
  },
  {
    id: "showSoldProducts",
    title: "Show sold products",
    description: "Let visitors see products you have already marked as sold.",
  },
  {
    id: "preciseLocation",
    title: "Precise location visibility",
    description: "Use neighbourhood-level location instead of city-only location.",
  },
  {
    id: "allowDirectMessages",
    title: "Allow direct messages",
    description: "Let logged-in marketplace users contact you about listings.",
  },
  {
    id: "personalizedRecommendations",
    title: "Personalized recommendations",
    description: "Use marketplace activity to improve suggested products.",
  },
  {
    id: "emailNotifications",
    title: "Email notifications",
    description: "Receive account, handoff, and review updates by email.",
  },
  {
    id: "pushNotifications",
    title: "Push notifications",
    description: "Prepare notification preferences for future mobile push alerts.",
  },
];

const defaultSettings: PrivacySettingsState = {
  profileVisible: true,
  showSellerRatings: true,
  showSoldProducts: false,
  preciseLocation: false,
  allowDirectMessages: true,
  personalizedRecommendations: true,
  emailNotifications: true,
  pushNotifications: false,
};

export default function PrivacySettingsPanel() {
  const [values, setValues] = useState(defaultSettings);
  const [notification, setNotification] = useState<NotificationState>(null);
  const enabledCount = useMemo(
    () => Object.values(values).filter(Boolean).length,
    [values],
  );

  const toggle = (id: keyof PrivacySettingsState) => {
    setValues((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <main className="page-shell form-shell">
      <section className="form-panel privacy-panel">
        <div>
          <p className="eyebrow">Account privacy</p>
          <h1>Privacy Settings</h1>
          <p className="hero-copy">
            Control what is visible on your marketplace profile. These settings
            are saved locally for now and are structured for future backend
            persistence.
          </p>
        </div>

        <div className="privacy-summary" aria-live="polite">
          <strong>{enabledCount} settings enabled</strong>
          <span>Review visibility, location, messaging, and notifications.</span>
        </div>

        <form
          className="privacy-settings-list"
          onSubmit={(event) => {
            event.preventDefault();
            setNotification({
              type: "success",
              message:
                "Privacy preferences saved locally. Backend sync can be added later.",
            });
          }}
        >
          {settings.map((setting) => (
            <label key={setting.id} className="privacy-setting-row">
              <span>
                <strong>{setting.title}</strong>
                <span>{setting.description}</span>
              </span>
              <input
                type="checkbox"
                checked={values[setting.id]}
                onChange={() => toggle(setting.id)}
                aria-label={setting.title}
              />
            </label>
          ))}

          <div className="info-card">
            <h2>Data and account controls</h2>
            <p>
              Data download, account export, and account deletion are planned
              controls. This page keeps those privacy decisions visible while
              persistence is added to the API.
            </p>
          </div>

          <button type="submit" className="primary-button">
            Save privacy settings
          </button>
          <FormNotification notification={notification} />
        </form>
      </section>
    </main>
  );
}
