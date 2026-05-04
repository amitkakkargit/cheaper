interface RatingStarsProps {
  rating: number;
  label: string;
}

const stars = [1, 2, 3, 4, 5];

export default function RatingStars({ rating, label }: RatingStarsProps) {
  return (
    <div className="rating-stars" aria-label={label} role="img">
      {stars.map((value) => (
        <svg
          key={value}
          viewBox="0 0 24 24"
          fill={rating >= value ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
      <span>{rating.toFixed(1)}</span>
    </div>
  );
}
