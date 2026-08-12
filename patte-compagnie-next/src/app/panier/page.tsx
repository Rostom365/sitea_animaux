"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadCart,
  updateQty,
  removeFromCart,
  clearCart,
  CartItem,
  CART_UPDATED_EVENT,
} from "@/lib/cart";
import { formatPrice } from "@/lib/categories";
import { getCustomerSession } from "@/lib/customerSession";
import { addOrder } from "@/services/orderService";

export default function PanierPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setCart(loadCart());
    refresh();
    window.addEventListener(CART_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.prix * item.qty, 0);
  const total = subtotal;

  const handleCheckout = async () => {
    setCheckoutError("");
    const customer = getCustomerSession();
    if (!customer) {
      setCheckoutError("Connectez-vous à votre compte pour passer une commande.");
      return;
    }
    if (cart.length === 0) return;

    setCheckingOut(true);
    try {
      const order = await addOrder({
        clientId: customer.id,
        clientName: `${customer.prenom} ${customer.nom}`.trim(),
        items: cart.map((item) => ({
          productId: item.id,
          productName: item.nom,
          prix: item.prix,
          quantite: item.qty,
          subTotal: item.prix * item.qty,
        })),
        total,
        status: "pending",
      });
      clearCart();
      setConfirmedOrderId(order.id || null);
    } catch {
      setCheckoutError("Erreur lors de la validation de la commande. Réessayez.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      <section className="cart-hero">
        <div className="container">
          <div className="paw-trail"><span>Votre panier</span></div>
          <h1>Votre panier</h1>
          <p className="lead" style={{maxWidth: "50ch"}}>Vérifiez vos articles avant de passer commande.</p>
        </div>
      </section>

      <section className="cart-section">
        <div className="container">
          <div className="cart-grid">

            <div className="panel cart-list" id="cart-list">
              {confirmedOrderId ? (
                <div className="cart-confirm">
                  <h2>Commande confirmée !</h2>
                  <p>Merci pour votre commande, elle a bien été enregistrée.</p>
                  <p className="ref">Référence : #{confirmedOrderId}</p>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    <Link href={`/facture/${confirmedOrderId}`} className="btn btn-primary">Voir / imprimer la facture</Link>
                    <Link href="/catalogue" className="btn btn-outline">Continuer mes achats</Link>
                  </div>
                </div>
              ) : cart.length === 0 ? (
                <div className="cart-empty">
                  <p>Votre panier est vide</p>
                  <Link href="/catalogue" className="btn btn-primary">Découvrir le catalogue</Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="cart-line" key={item.id}>
                    <div className="cart-thumb">
                      {item.image ? <img src={item.image} alt={item.nom} /> : null}
                    </div>
                    <div>
                      <div className="cart-line-name">{item.nom}</div>
                      <div className="cart-line-unit">{formatPrice(item.prix)} / unité</div>
                    </div>
                    <div className="qty-stepper">
                      <button type="button" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button type="button" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                    </div>
                    <span className="cart-line-price">{formatPrice(item.prix * item.qty)}</span>
                    <button type="button" className="icon-btn" onClick={() => removeFromCart(item.id)} aria-label="Retirer">✕</button>
                  </div>
                ))
              )}
            </div>

            <aside className="panel cart-summary" id="cart-summary">
              <h2>Récapitulatif</h2>
              <div className="cart-summary-row">
                <span>Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="cart-summary-row total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <button
                className="btn btn-primary"
                style={{width: "100%", justifyContent: "center", marginTop: "14px"}}
                onClick={handleCheckout}
                disabled={cart.length === 0 || checkingOut || !!confirmedOrderId}
              >
                {checkingOut ? "Validation…" : "Passer la commande"}
              </button>
              {checkoutError && <p className="error-msg">{checkoutError}</p>}
              <Link href="/catalogue" className="btn-ghost" style={{display: "block", textAlign: "center", marginTop: "6px"}}>← Continuer mes achats</Link>
            </aside>

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
