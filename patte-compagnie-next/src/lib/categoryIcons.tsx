import type { ReactElement } from "react";

export const CATEGORY_ICONS: Record<string, ReactElement> = {
  chien: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9c-1.5-1.5-2.5-1.2-2.5.5S4 12.5 5 12" />
      <path d="M19 9c1.5-1.5 2.5-1.2 2.5.5S20 12.5 19 12" />
      <path d="M6 11c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5c0 4-2.5 8.5-6 8.5s-6-4.5-6-8.5z" />
      <circle cx="9.5" cy="11" r=".6" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11" r=".6" fill="currentColor" stroke="none" />
      <path d="M11 14.2c.3.3.7.3 1 0" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4.5 8.5 10h7L18 4.5 15 9h-6L6 4.5z" />
      <path d="M6.5 9.5h11c1 0 1.5 1 1.5 2.5 0 4-2.5 7-7 7s-7-3-7-7c0-1.5.5-2.5 1.5-2.5z" />
      <circle cx="10" cy="13.5" r=".6" fill="currentColor" stroke="none" />
      <circle cx="14" cy="13.5" r=".6" fill="currentColor" stroke="none" />
      <path d="M9 16.2c.9.6 2 .6 3 0" />
      <path d="M4.5 13h2M4.5 15h2M17.5 13h2M17.5 15h2" />
    </svg>
  ),
  oiseau: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4.5c3.6 0 6 2.7 6 6.2 0 4.6-3.6 8.8-8.8 8.8-3 0-5.2-1.3-6.7-2.9 1.3.2 2.6 0 3.5-.6-1.6-.3-2.7-1.2-3.3-2.6.6.2 1.2.2 1.7 0-1.7-.6-2.7-2-2.7-3.8 0-.2 0-.4.05-.6.7.5 1.4.7 2.2.7-1.3-1-2-2.5-1.7-4.1 1.9 2.2 4.5 3.6 7.5 3.8-.1-.4-.15-.8-.15-1.3 0-1.9 1.5-3.6 3.5-3.6z" />
      <circle cx="17" cy="8.2" r=".55" fill="currentColor" stroke="none" />
    </svg>
  ),
  rongeur: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2.3" />
      <circle cx="15" cy="8" r="2.3" />
      <path d="M6.5 12c0-2.5 2-4 5.5-4s5.5 1.5 5.5 4c0 4-2.5 7-5.5 7s-5.5-3-5.5-7z" />
      <circle cx="10" cy="13.5" r=".55" fill="currentColor" stroke="none" />
      <circle cx="14" cy="13.5" r=".55" fill="currentColor" stroke="none" />
      <path d="M10.8 16c.7.5 1.7.5 2.4 0" />
      <path d="M4.5 12.5l2 .8M19.5 12.5l-2 .8" />
    </svg>
  ),
  poisson: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12c3-4 8-6 12-4.5 2 .7 3.5 2.2 4.5 4.5-1 2.3-2.5 3.8-4.5 4.5-4 1.5-9-.5-12-4.5z" />
      <path d="M19.5 12 22 9.5M19.5 12 22 14.5" />
      <circle cx="8" cy="10.8" r=".55" fill="currentColor" stroke="none" />
      <path d="M6 12.5c-1 .8-2 1-3 .8" />
    </svg>
  ),
};

export function PromoStarburst() {
  return (
    <svg viewBox="0 0 100 100" className="promo-starburst-svg">
      <polygon
        className="promo-starburst-star"
        points="50,2 57.76,21.02 74,8.43 71.21,28.79 91.57,26 78.98,42.24 98,50 78.98,57.76 91.57,74 71.21,71.21 74,91.57 57.76,78.98 50,98 42.24,78.98 26,91.57 28.79,71.21 8.43,74 21.02,57.76 2,50 21.02,42.24 8.43,26 28.79,28.79 26,8.43 42.24,21.02"
      />
      <text x="50" y="57" textAnchor="middle" className="promo-starburst-text">PROMO</text>
    </svg>
  );
}
