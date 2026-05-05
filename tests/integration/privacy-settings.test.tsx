import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AccountMenu from "@/components/AccountMenu";
import AppFooter from "@/components/AppFooter";
import PrivacySettingsPanel from "@/components/PrivacySettingsPanel";

jest.mock("@/lib/clientApi", () => ({
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

const clientApi = jest.requireMock("@/lib/clientApi");

describe("privacy settings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clientApi.getCachedCurrentUser.mockReturnValue(null);
    clientApi.getAccessToken.mockReturnValue("");
  });

  it("renders professional privacy settings controls", () => {
    render(<PrivacySettingsPanel />);

    expect(screen.getByRole("heading", { name: "Privacy Settings" })).toBeInTheDocument();
    expect(screen.getByLabelText("Public profile")).toBeChecked();
    expect(screen.getByLabelText("Show sold products")).not.toBeChecked();
  });

  it("saves privacy settings locally with success feedback", async () => {
    render(<PrivacySettingsPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Save privacy settings" }));

    expect(
      await screen.findByText("Privacy preferences saved locally. Backend sync can be added later."),
    ).toBeInTheDocument();
  });

  it("adds privacy settings link to avatar profile panel", async () => {
    clientApi.getCurrentUser.mockResolvedValue({
      id: "user-1",
      name: "Test User",
      sellers: [],
    });

    render(<AccountMenu />);

    fireEvent.click(await screen.findByRole("button", { name: "Open account settings" }));

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Privacy settings" })).toHaveAttribute(
        "href",
        "/privacy-settings",
      );
    });
  });

  it("renders cached account immediately without a sign-in flash", () => {
    clientApi.getCachedCurrentUser.mockReturnValue({
      id: "user-1",
      name: "Test User",
      sellers: [],
    });
    clientApi.getAccessToken.mockReturnValue("cached-token");
    clientApi.getCurrentUser.mockImplementation(() => new Promise(() => {}));

    render(<AccountMenu />);

    expect(screen.getByRole("button", { name: "Open account settings" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign in" })).not.toBeInTheDocument();
  });

  it("adds privacy settings link to the footer", () => {
    render(<AppFooter />);

    expect(screen.getByRole("link", { name: "Privacy Settings" })).toHaveAttribute(
      "href",
      "/privacy-settings",
    );
  });
});
