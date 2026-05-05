import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AppFooter from "@/components/AppFooter";
import AccountMenu from "@/components/AccountMenu";
import SupportTicketForm from "@/components/SupportTicketForm";
import * as clientApi from "@/lib/clientApi";

jest.mock("@/lib/clientApi", () => ({
  createSupportTicket: jest.fn(),
  getCurrentUser: jest.fn(),
  getCachedCurrentUser: jest.fn(() => null),
  getAccessToken: jest.fn(() => ""),
  requestEmailOtp: jest.fn(),
  requestPhoneOtp: jest.fn(),
  updateProfile: jest.fn(),
  verifyEmailOtp: jest.fn(),
  verifyPhoneOtp: jest.fn(),
  clearAccessToken: jest.fn(),
}));

describe("support ticket form", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(clientApi.getCachedCurrentUser).mockReturnValue(null);
    jest.mocked(clientApi.getAccessToken).mockReturnValue("");
  });

  it("validates required detail before submitting", () => {
    render(<SupportTicketForm />);

    fireEvent.change(screen.getByLabelText("Issue title"), {
      target: { value: "Bug" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit support ticket" }));

    expect(
      screen.getByText("Please add a title and at least 10 characters of detail."),
    ).toBeInTheDocument();
  });

  it("creates a support ticket and shows the reference", async () => {
    jest.mocked(clientApi.createSupportTicket).mockResolvedValue({
      id: "ticket-123",
      status: "OPEN",
      createdAt: "2026-05-05T12:00:00Z",
      message: "Support ticket created. Our team will review it soon.",
    });

    render(<SupportTicketForm />);

    fireEvent.change(screen.getByLabelText("Issue title"), {
      target: { value: "Login is broken" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "The OTP request button is not responding today." },
    });
    fireEvent.change(screen.getByLabelText("Email address (optional)"), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit support ticket" }));

    await waitFor(() => {
      expect(clientApi.createSupportTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: "Login is broken",
          email: "user@example.com",
          source: "web",
        }),
      );
    });
    expect((await screen.findAllByText(/ticket-123/)).length).toBeGreaterThan(0);
  });

  it("adds support link to the footer", () => {
    render(<AppFooter />);

    expect(screen.getByRole("link", { name: "Help & Support" })).toHaveAttribute(
      "href",
      "/support",
    );
  });

  it("adds support link to the avatar profile panel", async () => {
    jest.mocked(clientApi.getCurrentUser).mockResolvedValue({
      id: "user-1",
      name: "Test User",
      sellers: [],
    });

    render(<AccountMenu />);
    fireEvent.click(await screen.findByRole("button", { name: "Open account settings" }));

    expect(await screen.findByRole("link", { name: "Help & support" })).toHaveAttribute(
      "href",
      "/support",
    );
  });
});
