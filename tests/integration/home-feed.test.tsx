import { render, screen } from '@testing-library/react';
import HomeFeed from '@/components/HomeFeed';

const sampleProducts = [
  {
    id: 'p1',
    title: 'Demo product',
    description: 'Demo description',
    imageUrl: 'https://example.com/image.jpg',
    currentPrice: 100,
    previousPrice: 150,
    discountPercentage: 33,
    condition: 'New',
    location: 'Test City',
    category: 'Miscellaneous',
    sellerId: 's1',
    sellerName: 'Demo Seller',
    sellerLocation: 'Test City',
  },
];

describe('HomeFeed integration', () => {
  it('renders search inputs and product cards', () => {
    render(<HomeFeed products={sampleProducts} />);
    expect(screen.getByPlaceholderText(/Search for phone/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter neighbourhood/i)).toBeInTheDocument();
    expect(screen.getByText(/Demo product/i)).toBeInTheDocument();
  });
});
