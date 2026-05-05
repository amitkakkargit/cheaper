"use client";

import { useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/clientApi";
import FormNotification, {
  type NotificationState,
} from "@/components/FormNotification";

const categories = [
  "Electronics",
  "Home",
  "Fashion",
  "Vehicles",
  "Food",
  "Miscellaneous",
];
const conditions = ["New", "Second-hand", "Used", "Refurbished"];

export default function PostProductForm() {
  const [notification, setNotification] = useState<NotificationState>(null);
  const [sellerId, setSellerId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [currentPrice, setCurrentPrice] = useState(1);
  const [previousPrice, setPreviousPrice] = useState(1);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  return (
    <main className="page-shell form-shell">
      <Link href="/" className="back-link">
        Back to feed
      </Link>
      <section className="form-panel" aria-labelledby="post-product-heading">
        <div>
          <p className="eyebrow">Seller posting</p>
          <h1 id="post-product-heading">Post your product in minutes</h1>
          <p className="hero-copy">
            Add product details, pricing, and a pickup location for nearby buyers.
          </p>
        </div>
        <form
          className="marketplace-form"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              const discountPercentage = previousPrice
                ? Math.max(
                    0,
                    Math.round(
                      ((previousPrice - currentPrice) / previousPrice) * 100,
                    ),
                  )
                : 0;
              await apiRequest("/products", {
                method: "POST",
                body: JSON.stringify({
                  sellerId,
                  title,
                  description,
                  imageUrl,
                  currentPrice,
                  previousPrice,
                  discountPercentage,
                  condition,
                  location,
                  category,
                  latitude: 12.9716,
                  longitude: 77.5946,
                }),
              });
              setNotification({ type: "success", message: "Product posted." });
            } catch (error) {
              setNotification({
                type: "error",
                message:
                  error instanceof Error
                    ? error.message
                    : "Product creation failed",
              });
            }
          }}
        >
          <label className="field-label">
            Seller ID
            <input
              type="text"
              value={sellerId}
              onChange={(event) => setSellerId(event.target.value)}
              placeholder="Create a seller first, then paste its id"
              aria-label="Seller ID"
              required
            />
          </label>
          <label className="field-label">
            Product title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Handmade chair with cushion"
              aria-label="Product title"
              required
            />
          </label>
          <label className="field-label">
            Category
            <select
              aria-label="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            >
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
            <select
              aria-label="Condition"
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
              required
            >
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
              Current price (INR)
              <input
                type="number"
                min="1"
                value={currentPrice}
                onChange={(event) => setCurrentPrice(Number(event.target.value))}
                aria-label="Current price"
                required
              />
            </label>
            <label className="field-label">
              Previous price (INR)
              <input
                type="number"
                min="1"
                value={previousPrice}
                onChange={(event) => setPreviousPrice(Number(event.target.value))}
                aria-label="Previous price"
              />
            </label>
          </div>
          <label className="field-label">
            Location
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Bangalore, Koramangala"
              aria-label="Location"
              required
            />
          </label>
          <label className="field-label">
            Description
            <textarea
              placeholder="Describe the product condition, size, and nearby pickup option."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              aria-label="Description"
              rows={5}
              required
            />
          </label>
          <label className="field-label">
            Image URL
            <input
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://example.com/product.jpg"
              aria-label="Image URL"
              required
            />
          </label>
          <button className="primary-button" type="submit">
            Post product
          </button>
          <FormNotification notification={notification} />
        </form>
      </section>
    </main>
  );
}
