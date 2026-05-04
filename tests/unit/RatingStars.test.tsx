import { render, screen } from '@testing-library/react';
import RatingStars from '@/components/RatingStars';

describe('RatingStars component', () => {
  it('renders star icons and label', () => {
    render(<RatingStars rating={4.2} label="Test rating" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Test rating');
    expect(screen.getByText('4.2')).toBeInTheDocument();
  });
});
