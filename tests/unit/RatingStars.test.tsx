import { render, screen, fireEvent } from "@testing-library/react";
import RatingStars, { roundRatingToHalf } from "@/components/RatingStars";

describe("RatingStars component", () => {
  it("renders star icons and label", () => {
    render(<RatingStars rating={4.2} label="Test rating" />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "Test rating",
    );
    expect(screen.getByText("4.2")).toBeInTheDocument();
  });

  it("allows interactive rating selection", () => {
    const mockOnRatingChange = jest.fn();
    render(
      <RatingStars
        rating={3}
        label="Interactive rating"
        interactive={true}
        onRatingChange={mockOnRatingChange}
      />,
    );

    const stars = screen.getAllByRole("button");
    expect(stars).toHaveLength(10);

    fireEvent.click(screen.getByLabelText("Rate 3.5 out of 5"));
    expect(mockOnRatingChange).toHaveBeenCalledWith(3.5);
  });

  it("is not interactive by default", () => {
    render(<RatingStars rating={4.2} label="Test rating" />);
    const stars = screen.queryAllByRole("button");
    expect(stars).toHaveLength(0); // No buttons when not interactive
  });

  it("rounds averages to the nearest half for visual fill", () => {
    expect(roundRatingToHalf(4.3)).toBe(4.5);
    expect(roundRatingToHalf(3.2)).toBe(3);
  });
});
