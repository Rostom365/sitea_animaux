"use client";

import { use as usePromise, useEffect, useState } from "react";
import Link from "next/link";
import { getProduct, getProducts, Product } from "@/services/productService";
import { categoryLabel, subcategoryLabel, formatPrice } from "@/lib/categories";
import { addToCart, CART_UPDATED_EVENT } from "@/lib/cart";

function stockBadge(stock: number) {
  if (stock <= 0) return <span className="stock-badge stock-out">Rupture</span>;
  if (stock <= 5) return <span className="stock-badge stock-low">Stock faible</span>;
  return <span className="stock-badge stock-ok">En stock</span>;
}

export default function ProduitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setProduct(null);
    setNotFound(false);
    setQty(1);
    setFeedback("");

    getProduct(id)
      .then((p) => {
        setProduct(p);
        return getProducts().then((all) =>
          setSimilar(all.filter((item) => item.categorie === p.categorie && item.id !== p.id).slice(0, 4))
        );
      })
      .catch(() => setNotFound(true));
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addToCart(product, qty);
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
    setFeedback("Ajouté au panier ✔");
  }

  if (notFound) {
    return (
      <section className="product-detail-section">
        <div className="container">
          <div className="empty-state">
            <h3>Produit introuvable</h3>
            <p>Ce produit n&apos;existe plus ou a été retiré du catalogue.</p>
            <Link href="/catalogue" className="btn btn-primary">Retour au catalogue</Link>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="product-detail-section">
        <div className="container">
          <p>Chargement…</p>
        </div>
      </section>
    );
  }

  const stock = Number(product.stock) || 0;

  return (
    <section className="product-detail-section">
      <div className="container">
        <div className="product-detail">
          <div className="product-detail-img">
            {product.promo && (
              <span className="promo-badge promo-badge-lg" title="Article en promotion">★</span>
            )}
            {product.image ? <img src={product.image} alt={product.nom} /> : null}
          </div>
          <div className="product-detail-body">
            <span className="product-cat">
              {categoryLabel(product.categorie)} · {subcategoryLabel(product.categorie, product.sousCategorie)}
            </span>
            <h1>{product.nom}</h1>
            <div className="product-detail-price">{formatPrice(product.prix)}</div>
            {stockBadge(stock)}
            <p className="product-detail-desc">{product.description || "Aucune description pour ce produit."}</p>
            <div className="product-detail-actions">
              <div className="qty-stepper">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => (stock > 0 ? Math.min(q + 1, stock) : q + 1))}
                >
                  +
                </button>
              </div>
              <button className="btn btn-primary" disabled={stock <= 0} onClick={handleAddToCart}>
                Ajouter au panier
              </button>
            </div>
            <p className="feedback-msg">{feedback}</p>
          </div>
        </div>

        {similar.length > 0 && (
          <div className="similar-section">
            <h2>Produits similaires</h2>
            <div className="product-grid">
              {similar.map((p) => (
                <div className="product-card" key={p.id}>
                  {p.promo && <span className="promo-badge" title="Article en promotion">★</span>}
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
