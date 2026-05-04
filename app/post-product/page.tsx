'use client';

import { useState } from 'react';
import Link from 'next/link';

const categories = ['Electronics', 'Home', 'Fashion', 'Vehicles', 'Food', 'Miscellaneous'];
const conditions = ['New', 'Second-hand', 'Used', 'Refurbished'];

export default function PostProductPage() {
  const [status, setStatus] = useState('');

  return (
    <main className="page-shell form-shell">
      <Link href="/" className="back-link">
        ← Back to feed
      </Link>
      <section className="form-panel">
        <div>
          <p className="eyebrow">Seller posting</p>
          <h1>Post your product in minutes</h1>
          <p className="hero-copy">
            Add product details, pricing, and images. This screen is ready for a real API later.
          </p>
        </div>
        <form className="marketplace-form" onSubmit={(event) => event.preventDefault()}>
          <label className="field-label">
            Product title
            <input type="text" placeholder="Handmade chair with cushion" aria-label="Product title" required />
          </label>
          <label className="field-label">
            Category
            <select aria-label="Category" required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Condition
            <select aria-label="Condition" required>
              <option value="">Select condition</option>
              {conditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </label>
          <div className="field-row">
            <label className="field-label">
              Current price (₹)
              <input type="number" min="1" aria-label="Current price" required />
            </label>
            <label className="field-label">
              Previous price (₹)
              <input type="number" min="1" aria-label="Previous price" />
            </label>
          </div>
          <label className="field-label">
            Location
            <input type="text" placeholder="Bangalore, Koramangala" aria-label="Location" required />
          </label>
          <label className="field-label">
            Description
            <textarea placeholder="Describe the product condition, size, and nearby pickup option." aria-label="Description" rows={5} required />
          </label>
          <label className="field-label">
            Image URL
            <input type="url" placeholder="https://example.com/product.jpg" aria-label="Image URL" required />
          </label>
          <button className="primary-button" type="submit" onClick={() => setStatus('Preview mode only. Data creation coming soon.')}>Save draft</button>
          {status ? <p className="status-text">{status}</p> : null}
        </form>
      </section>
    </main>
  );
}
