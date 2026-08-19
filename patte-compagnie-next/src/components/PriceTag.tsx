import { formatPrice } from "@/lib/categories";

export default function PriceTag({ prix, ancienPrix, promo }: { prix: number; ancienPrix?: number | null; promo?: boolean }) {
  if (promo && ancienPrix) {
    return (
      <span className="product-price-wrap">
        <span className="product-price-old">{formatPrice(ancienPrix)}</span>
        <span className="product-price">{formatPrice(prix)}</span>
      </span>
    );
  }
  return <span className="product-price">{formatPrice(prix)}</span>;
}
