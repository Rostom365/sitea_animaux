"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProducts, Product } from "@/services/productService";
import { CATEGORIES, SUBCATEGORIES } from "@/lib/categories";
import { CATEGORY_ICONS, PromoStarburst } from "@/lib/categoryIcons";

export default function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return (
    <>
      <section className="categories" id="categories">
        <div className="container">
          <div className="paw-trail"><span>Par univers</span></div>
          <h2>Choisissez un univers</h2>
          <div className="cat-grid" id="cat-grid">
            {CATEGORIES.map((cat) => {
              const hasPromo = products.some((p) => p.categorie === cat.id && p.promo);
              return (
                <div className="cat-card" key={cat.id}>
                  {hasPromo && (
                    <Link
                      href={`/catalogue?cat=${cat.id}&promo=1`}
                      className="promo-starburst-badge cat-card-promo"
                      title="Voir les promotions"
                    >
                      <PromoStarburst />
                    </Link>
                  )}
                  <Link href={`/catalogue?cat=${cat.id}`} className="cat-card-main">
                    {CATEGORY_ICONS[cat.id]}
                    <span>{cat.label}</span>
                  </Link>
                  <div className="subcat-chips">
                    {(SUBCATEGORIES[cat.id] || []).map((s) => (
                      <Link
                        key={s.id}
                        href={`/catalogue?cat=${cat.id}&sub=${s.id}`}
                        className="subcat-chip"
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="site-footer" id="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h4>Patte &amp; Compagnie</h4>
              <p>Votre animalerie de quartier, en ligne. Produits sélectionnés pour le bien-être de vos compagnons à quatre pattes, à plumes ou à écailles.</p>
            </div>
            <div>
              <h4>Boutique</h4>
              <ul>
                <li><Link href="/catalogue">Catalogue</Link></li>
                <li><Link href="/categories">Catégories</Link></li>
                <li><Link href="/admin">Espace vendeur</Link></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li><Link href="/contact" data-contact-email>contact@patte-compagnie.tn</Link></li>
                <li data-contact-telephone>+216 00 000 000</li>
                <li data-contact-adresse>Tunis, Tunisie</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Patte &amp; Compagnie — Site de démonstration</span>
            <Link href="/admin">Accès vendeur →</Link>
          </div>
        </div>
      </footer>
    </>
  );
}