"use client";

import { useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/clientApi";
import FormNotification, { type NotificationState } from "@/components/FormNotification";

export default function CreateSellerPage() {
  const [notification, setNotification] = useState<NotificationState>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  return (
    <main className="page-shell form-shell">
      <Link href="/" className="back-link">
        ← Back to feed
      </Link>
      <section className="form-panel">
        <div>
          <p className="eyebrow">Seller onboarding</p>
          <h1>Create a professional seller profile</h1>
          <p className="hero-copy">
            Add your seller information and local pickup details so buyers can trust your listings.
          </p>
        </div>
        <form
          className="marketplace-form"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              const seller = await apiRequest<{ id: string }>("/sellers", {
                method: "POST",
                body: JSON.stringify({
                  name,
                  location,
                  bio,
                  avatarUrl,
                  latitude: 12.9716,
                  longitude: 77.5946,
                }),
              });
              setNotification({
                type: "success",
                message: `Seller created. Seller ID: ${seller.id}`,
              });
            } catch (error) {
              setNotification({
                type: "error",
                message: error instanceof Error ? error.message : "Seller creation failed",
              });
            }
          }}
        >
          <label className="field-label">
            Seller name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Sunil's Store"
              aria-label="Seller name"
              required
            />
          </label>
          <label className="field-label">
            Location
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Hyderabad, Gachibowli"
              aria-label="Seller location"
              required
            />
          </label>
          <label className="field-label">
            Preferred item types
            <input
              type="text"
              placeholder="Furniture, gadgets, outdoor"
              aria-label="Preferred item types"
            />
          </label>
          <label className="field-label">
            Seller bio
            <textarea
              placeholder="Trusted local seller with fast replies and verified deals."
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              aria-label="Seller bio"
              rows={4}
              required
            />
          </label>
          <label className="field-label">
            Profile image URL
            <input
              type="url"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://example.com/seller.jpg"
              aria-label="Profile image URL"
            />
          </label>
          <button
            className="primary-button"
            type="submit"
          >
            Create profile
          </button>
          <FormNotification notification={notification} />
        </form>
      </section>
    </main>
  );
}
