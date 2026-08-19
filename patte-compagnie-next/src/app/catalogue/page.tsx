"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getProducts, Product } from "@/services/productService";
import { CATEGORIES, SUBCATEGORIES, categoryLabel, subcategoryLabel, formatPrice } from "@/lib/categories";
import { addToCart, CART_UPDATED_EVENT } from "@/lib/cart";

function stockBadge(stock: number) {
  if (stock <= 0) return <span className="stock-badge stock-out">Rupture</span>;
  if (stock <= 5) return <span className="stock-badge stock-low">Stock faible</span>;
  return <span className="stock-badge stock-ok">En stock</span>;
}

const quickNav = [
  { id: "chien", label: "Chien", image: "chien/4d09c818dfdb66872f91de47c23a1fa0.jpg" },
  { id: "chat", label: "Chat", image: "chats/b63e8c3ca7c64b4581e692572a953ec5.jpg" },
  { id: "oiseau", label: "Oiseau", image: "oiseuax/oisaux.jpg" },
  { id: "rongeur", label: "Rongeurs", image: "souris/souris-1024x1024.jpg" },
  { id: "poisson", label: "Poisson", image: "poisson/poisson-clown-a-trois-bandes.jpg" },
];

function CatalogueContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState(searchParams.get("cat") || "");
  const [sub, setSub] = useState(searchParams.get("sub") || "");
  const [sort, setSort] = useState("");
  const promoOnly = searchParams.get("promo") === "1";

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const subOptions = useMemo(() => (cat ? SUBCATEGORIES[cat] || [] : []), [cat]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchQ = !q || p.nom.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
      const matchCat = !cat || p.categorie === cat;
      const matchSub = !sub || p.sousCategorie === sub;
      const matchPromo = !promoOnly || p.promo;
      return matchQ && matchCat && matchSub && matchPromo;
    });
    if (sort === "price-asc") list.sort((a, b) => Number(a.prix) - Number(b.prix));
    else if (sort === "price-desc") list.sort((a, b) => Number(b.prix) - Number(a.prix));
    else if (sort === "name-asc") list.sort((a, b) => a.nom.localeCompare(b.nom));
    return list;
  }, [products, search, cat, sub, promoOnly, sort]);

  function handleAddToCart(p: Product) {
    addToCart(p, 1);
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }

  return (
    <section className="products-section" id="catalogue">
      <div className="container">
        <div className="mk-panel">
          <div className="products-head">
            <div>
              <div className="paw-trail"><span>{promoOnly ? "Promotions" : "Catalogue"}</span></div>
              <h2>
                {promoOnly
                  ? cat
                    ? `Promotions — ${categoryLabel(cat)}`
                    : "Toutes les promotions"
                  : "Nos produits"}
              </h2>
            </div>
            <div className="filters">
              <input
                type="search"
                placeholder="Rechercher un produit…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                value={cat}
                onChange={(e) => {
                  setCat(e.target.value);
                  setSub("");
                }}
              >
                <option value="">Tous les animaux</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <select value={sub} onChange={(e) => setSub(e.target.value)} disabled={!cat}>
                <option value="">Toutes les sous-catégories</option>
                {subOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="">Trier par</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="name-asc">Nom A→Z</option>
              </select>
            </div>
          </div>

          <div className="mk-quicknav">
            {quickNav.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`mk-quicknav-item ${cat === c.id ? "active" : ""}`}
                onClick={() => { setCat(cat === c.id ? "" : c.id); setSub(""); }}
                style={{ background: "none", border: "none" }}
              >
                <div className="mk-quicknav-photo" style={{ backgroundImage: `url('${c.image}')` }}></div>
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          <div className="product-grid">
            {loading ? (
              <div className="empty-state">
                <h3>Chargement…</h3>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <h3>{products.length === 0 ? "Aucun produit pour l'instant" : "Aucun résultat"}</h3>
                <p>
                  {products.length === 0
                    ? "Le catalogue sera bientôt garni ! Le vendeur peut ajouter des produits depuis l'espace vendeur."
                    : "Essayez une autre recherche ou une autre catégorie."}
                </p>
              </div>
            ) : (
              filtered.map((p) => (
                <div className="product-card" key={p.id}>
                  {p.promo && <span className="promo-badge" title="Article en promotion">Promo</span>}
                  <Link href={`/produit/${p.id}`} target="_blank" rel="noopener noreferrer" className="product-img product-link-img">
                    {p.image ? <img src={p.image} alt={p.nom} /> : null}
                  </Link>
                  <div className="product-body">
                    <span className="product-cat">
                      {categoryLabel(p.categorie)} · {subcategoryLabel(p.categorie, p.sousCategorie)}
                    </span>
                    <Link href={`/produit/${p.id}`} target="_blank" rel="noopener noreferrer" className="product-link-name">
                      <h3 className="product-name">{p.nom}</h3>
                    </Link>
                    <div className="product-foot">
                      <span className="product-price">{formatPrice(p.prix)}</span>
                      {stockBadge(Number(p.stock))}
                    </div>
                    <button
                      className="add-btn"
                      disabled={Number(p.stock) <= 0}
                      onClick={() => handleAddToCart(p)}
                    >
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={null}>
      <CatalogueContent />
    </Suspense>
  );
}
