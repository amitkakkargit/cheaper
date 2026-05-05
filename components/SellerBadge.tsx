import Link from "next/link";
import type { Seller } from "@/lib/types";
import RatingStars from "./RatingStars";

interface SellerBadgeProps {
  seller: Seller;
}

export default function SellerBadge({ seller }: SellerBadgeProps) {
  return (
    <div className="info-card">
      <div className="seller-card-row">
        <img
          src={seller.avatarUrl}
          alt={`${seller.name} seller profile image`}
          className="seller-avatar"
        />
        <div>
          <p className="eyebrow">Seller</p>
          <h3>{seller.name}</h3>
          <p className="muted-text">{seller.location}</p>
        </div>
      </div>
      <div className="seller-bio">
        <p>{seller.bio}</p>
        <Link href={`/seller/${seller.id}`} className="secondary-button">
          View profile
        </Link>
      </div>
    </div>
  );
}
