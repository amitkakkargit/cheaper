"use client";

import { useState } from "react";
import Link from "next/link";

export default function CreateSellerPage() {
  const [status, setStatus] = useState("");

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
            Add your seller information, ratings, and local details so buyers
            can trust your listings.
          </p>
        </div>
        <form
          className="marketplace-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="field-label">
            Seller name
            <input
              type="text"
              placeholder="Sunil's Store"
              aria-label="Seller name"
              required
            />
          </label>
          <label className="field-label">
            Location
            <input
              type="text"
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
              aria-label="Seller bio"
              rows={4}
              required
            />
          </label>
          <label className="field-label">
            Profile image URL
            <input
              type="url"
              placeholder="https://example.com/seller.jpg"
              aria-label="Profile image URL"
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            onClick={() =>
              setStatus(
                "Profile preview only. Backend integration coming soon.",
              )
            }
          >
            Create profile
          </button>
          {status ? <p className="status-text">{status}</p> : null}
        </form>
      </section>
    </main>
  );
}
