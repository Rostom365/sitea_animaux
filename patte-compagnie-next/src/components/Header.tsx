"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getCartCount, CART_UPDATED_EVENT } from "@/lib/cart";
import { getCustomerSession, SESSION_UPDATED_EVENT, CustomerSession } from "@/lib/customerSession";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [customer, setCustomer] = useState<CustomerSession | null>(null);

  useEffect(() => {
    const refreshCart = () => setCartCount(getCartCount());
    const refreshSession = () => setCustomer(getCustomerSession());
    refreshCart();
    refreshSession();
    window.addEventListener(CART_UPDATED_EVENT, refreshCart);
    window.addEventListener(SESSION_UPDATED_EVENT, refreshSession);
    window.addEventListener("storage", refreshCart);
    window.addEventListener("storage", refreshSession);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refreshCart);
      window.removeEventListener(SESSION_UPDATED_EVENT, refreshSession);
      window.removeEventListener("storage", refreshCart);
      window.removeEventListener("storage", refreshSession);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="container">
        <div className="bar">
          <Link href="/" className="logo">
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="12" cy="5" rx="3" ry="4"/>
              <path d="M6 12c0-1.5-1-2.5-2-2.5s-2 1-2 2.5c0 2 1 3 2 3s2-1 2-3zM18 12c0-1.5-1-2.5-2-2.5s-2 1-2 2.5c0 2 1 3 2 3s2-1 2-3zM10 16c-1 0-1.5.8-1.5 2s.5 2 1.5 2h4c1 0 1.5-.8 1.5-2s-.5-2-1.5-2h-4z"/>
            </svg>
            <span>Zoo<br/>Market</span>
          </Link>

          <nav className="main-nav">
            <li><Link href="/">Accueil</Link></li>
            <li><Link href="/catalogue">Catalogue</Link></li>
            <li><Link href="/categories">Catégories</Link></li>
            <li><Link href="/catalogue?promo=1" style={{ color: "#E63946" }}>Promotions</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </nav>

          <div className="header-actions">
            <Link href="/compte" className="btn btn-outline btn-small">
              {customer ? `Bonjour, ${customer.prenom}` : "Mon compte"}
            </Link>
            <Link href="/panier" className="cart-btn">
              Panier
              <span className="cart-count">{cartCount}</span>
            </Link>
            <button className="burger" onClick={() => setMenuOpen(!menuOpen)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
