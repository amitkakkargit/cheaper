"use client";

import { useState } from "react";
import { createSupportTicket } from "@/lib/clientApi";
import type { SupportTicketCategory } from "@/lib/types";
import FormNotification, { type NotificationState } from "./FormNotification";

const categories: SupportTicketCategory[] = [
  "Login issue",
  "Payment issue",
  "Product issue",
  "Seller issue",
  "App bug",
  "Account issue",
  "Delivery issue",
  "Other",
];

const getDeviceInfo = () => {
  if (typeof window === "undefined") return "Server render";
  return `${window.navigator.userAgent} | ${window.innerWidth}x${window.innerHeight}`;
};

export default function SupportTicketForm() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SupportTicketCategory>("App bug");
  const [email, setEmail] = useState("");
  const [productId, setProductId] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [notification, setNotification] = useState<NotificationState>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (subject.trim().length < 3 || description.trim().length < 10) {
      setNotification({
        type: "error",
        message: "Please add a title and at least 10 characters of detail.",
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);
    try {
      const ticket = await createSupportTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
        email: email.trim() || undefined,
        productId: productId.trim() || undefined,
        screenshotUrl: screenshotUrl.trim() || undefined,
        source: "web",
        deviceInfo: getDeviceInfo(),
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? "web-local",
      });
      setTicketId(ticket.id);
      setNotification({
        type: "success",
        message: `${ticket.message} Ticket reference: ${ticket.id}`,
      });
      setSubject("");
      setDescription("");
      setProductId("");
      setScreenshotUrl("");
    } catch (error) {
      setNotification({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to create support ticket",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-shell form-shell">
      <section className="form-panel support-panel">
        <div>
          <p className="eyebrow">Help center</p>
          <h1>Contact Cheaper Support</h1>
          <p className="hero-copy">
            Tell us what is not working. We will create a support ticket, notify
            the support team, and send a confirmation email when you provide an
            email address.
          </p>
        </div>

        {ticketId ? (
          <div className="privacy-summary">
            <strong>Latest ticket</strong>
            <span>{ticketId}</span>
          </div>
        ) : null}

        <form className="marketplace-form" onSubmit={submit}>
          <label className="field-label">
            Issue title
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Unable to confirm product handoff"
              required
              minLength={3}
              maxLength={140}
            />
          </label>

          <label className="field-label">
            Category
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as SupportTicketCategory)
              }
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what happened, what you expected, and any error message you saw."
              required
              minLength={10}
              maxLength={4000}
            />
          </label>

          <div className="field-row">
            <label className="field-label">
              Email address (optional)
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label className="field-label">
              Related product ID (optional)
              <input
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                placeholder="Product reference"
              />
            </label>
          </div>

          <label className="field-label">
            Screenshot URL (optional)
            <input
              value={screenshotUrl}
              onChange={(event) => setScreenshotUrl(event.target.value)}
              placeholder="Paste an image URL or upload placeholder reference"
            />
          </label>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating ticket..." : "Submit support ticket"}
          </button>
          <FormNotification notification={notification} />
        </form>
      </section>
    </main>
  );
}
