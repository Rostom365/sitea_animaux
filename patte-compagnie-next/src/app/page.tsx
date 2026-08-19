"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProducts, Product } from "@/services/productService";
import { CATEGORIES, formatPrice } from "@/lib/categories";

const categoryCards = [
  { id: "chien", label: "Chien", image: "chien/4d09c818dfdb66872f91de47c23a1fa0.jpg" },
  { id: "chat", label: "Chat", image: "chats/b63e8c3ca7c64b4581e692572a953ec5.jpg" },
  { id: "oiseau", label: "Oiseau", image: "oiseuax/oisaux.jpg" },
  { id: "rongeur", label: "Rongeurs", image: "souris/souris-1024x1024.jpg" },
  { id: "poisson", label: "Poisson", image: "poisson/poisson-clown-a-trois-bandes.jpg" },
];

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchCat, setSearchCat] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getProducts().then((data) => setProducts(data.slice(0, 4)));
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCat) params.set("cat", searchCat);
    if (searchQuery) params.set("q", searchQuery);
    router.push(`/catalogue${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <>
      <section className="tv-hero">
        <div className="container">
          <div className="tv-hero-inner">
            <div>
              <div className="paw-trail">
                <span></span><span></span><span></span>
                <span>Boutique animalière</span>
              </div>
              <h1>Tout pour le bonheur de votre compagnon</h1>
              <p className="lead">
                Alimentation, jeux, accessoires et soins pour chiens, chats, oiseaux, rongeurs et poissons —
                sélectionnés avec attention par notre équipe.
              </p>
              <div className="hero-cta">
                <Link href="/catalogue" className="btn btn-primary">Découvrir le catalogue</Link>
                <Link href="/categories" className="btn btn-outline">Voir les catégories</Link>
              </div>

              <form className="tv-search" onSubmit={handleSearch}>
                <select value={searchCat} onChange={(e) => setSearchCat(e.target.value)}>
                  <option value="">Tous les animaux</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="search"
                  placeholder="Rechercher un produit…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">Rechercher</button>
              </form>
            </div>

            <div className="tv-hero-art">
              <div className="tv-hero-blob"></div>
              <img src="famille-animaux.jpg" alt="Chien, chat, hamster et oiseau, nos compagnons" />
            </div>
          </div>
        </div>
      </section>

      <section className="feature-strip">
        <div className="container">
          <div className="feature-grid">
            <div className="feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>
              <div>
                <h4>Produits vérifiés</h4>
                <p>Une sélection soigneusement contrôlée pour vos compagnons.</p>
              </div>
            </div>
            <div className="feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 17.3l-6.2 3.6 1.6-7-5.4-4.6 7.1-.6L12 2l2.9 6.7 7.1.6-5.4 4.6 1.6 7z"/></svg>
              <div>
                <h4>Qualité et confiance</h4>
                <p>Des marques reconnues pour le bien-être animal.</p>
              </div>
            </div>
            <div className="feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="7" width="15" height="10" rx="2"/><path d="M16 10h3l3 3v4h-6z"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>
              <div>
                <h4>Service de proximité</h4>
                <p>Votre animalerie de quartier, en ligne.</p>
              </div>
            </div>
            <div className="feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20c4-2 8-5 8-10V5l-8-3-8 3v5c0 5 4 8 8 10z"/></svg>
              <div>
                <h4>Support dédié</h4>
                <p>Notre équipe est là pour vous conseiller.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="stats-row">
            <div className="stat-item">
              <div className="num">440+</div>
              <div className="label">Produits au catalogue</div>
            </div>
            <div className="stat-item">
              <div className="num">5</div>
              <div className="label">Univers d&apos;animaux</div>
            </div>
            <div className="stat-item">
              <div className="num">100%</div>
              <div className="label">Dédié au bien-être animal</div>
            </div>
            <div className="stat-item">
              <div className="num">24/7</div>
              <div className="label">Boutique ouverte en ligne</div>
            </div>
          </div>
        </div>
      </section>

      <section className="category-cards">
        <div className="container">
          <div className="paw-trail"><span></span><span></span><span></span><span>Univers</span></div>
          <h2>Trouvez ce qu&apos;il faut pour votre animal</h2>
          <div className="category-cards-grid" style={{ marginTop: 24 }}>
            {categoryCards.map((c) => (
              <Link key={c.id} href={`/catalogue?cat=${c.id}`} className="category-card" style={{ backgroundImage: `url('${c.image}')` }}>
                <div className="category-card-scrim"></div>
                <span className="category-card-label">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {products.length > 0 && (
        <section className="products-section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="products-head">
              <div>
                <div className="paw-trail"><span></span><span></span><span></span><span>Populaires</span></div>
                <h2>Produits populaires</h2>
              </div>
              <Link href="/catalogue" className="btn btn-outline">Voir le catalogue</Link>
            </div>
            <div className="product-grid">
              {products.map((p) => (
                <div className="product-card" key={p.id}>
                  {p.promo && <span className="ribbon">PROMO</span>}
                  <Link href={`/produit/${p.id}`} target="_blank" rel="noopener noreferrer" className="product-img product-link-img">
                    {p.image ? <img src={p.image} alt={p.nom} /> : null}
                  </Link>
                  <div className="product-body">
                    <Link href={`/produit/${p.id}`} target="_blank" rel="noopener noreferrer" className="product-link-name">
                      <h3 className="product-name">{p.nom}</h3>
                    </Link>
                    <div className="product-foot">
                      <span className="product-price">{formatPrice(p.prix)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="container">
          <div className="cta-banner">
            <h2>Prenez soin de ceux qui comptent le plus</h2>
            <p>Rejoignez les propriétaires d&apos;animaux qui font confiance à Patte &amp; Compagnie en Tunisie.</p>
            <Link href="/catalogue" className="btn" style={{ background: "#fff", color: "var(--green)" }}>Découvrir le catalogue</Link>
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
