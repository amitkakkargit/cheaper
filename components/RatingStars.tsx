interface RatingStarsProps {
  rating: number;
  label: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const stars = [1, 2, 3, 4, 5];
const ratingOptions = Array.from({ length: 10 }, (_, index) => (index + 1) / 2);

export const roundRatingToHalf = (rating: number) =>
  Math.max(0, Math.min(5, Math.round(rating * 2) / 2));

const getFillPercent = (rating: number, star: number) => {
  const rounded = roundRatingToHalf(rating);
  if (rounded >= star) return 100;
  if (rounded >= star - 0.5) return 50;
  return 0;
};

export default function RatingStars({
  rating,
  label,
  interactive = false,
  onRatingChange,
}: RatingStarsProps) {
  return (
    <div className="rating-stars" aria-label={label} role="img">
      <div className="rating-star-visuals" aria-hidden="true">
        {stars.map((value) => (
          <span key={value} className="rating-star-shell">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span
              className="rating-star-fill"
              style={{ width: `${getFillPercent(rating, value)}%` }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </span>
          </span>
        ))}
      </div>
      {interactive ? (
        <div className="rating-hit-grid">
          {ratingOptions.map((value) => (
            <button
              key={value}
              type="button"
              className="rating-half-button"
              aria-label={`Rate ${value.toFixed(1)} out of 5`}
              onClick={() => onRatingChange?.(value)}
            />
          ))}
        </div>
      ) : null}
      <span>{rating.toFixed(1)}</span>
    </div>
  );
}
