"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { use as usePromise } from "react";
import { getOrder, Order } from "@/services/orderService";
import { getClient, Client } from "@/services/clientService";
import { formatPrice } from "@/lib/categories";

export default function FacturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrder(id)
      .then((o) => {
        setOrder(o);
        return getClient(o.clientId).catch(() => null);
      })
      .then((c) => setClient(c))
      .catch(() => setError("Commande introuvable."));
  }, [id]);

  if (error) {
    return (
      <section className="invoice-section">
        <div className="container">
          <p className="error-msg">{error}</p>
          <Link href="/compte" className="btn btn-outline">← Retour à mon compte</Link>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="invoice-section">
        <div className="container">
          <p>Chargement…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="invoice-section">
      <div className="container">
        <div className="invoice-actions">
          <button className="btn btn-primary" onClick={() => window.print()}>Imprimer la facture</button>
          <Link href="/compte" className="btn btn-outline">← Retour à mon compte</Link>
        </div>

        <div className="panel invoice-paper">
          <div className="invoice-top">
            <div>
              <div className="invoice-brand">Patte &amp; Compagnie</div>
              <p style={{ color: "#5b6157", fontSize: ".88rem", marginTop: "4px" }}>
                Tunis, Tunisie<br />
                contact@patte-compagnie.tn<br />
                +216 00 000 000
              </p>
            </div>
            <div className="invoice-meta">
              <h2>Facture</h2>
              <p>N° {order.id}</p>
              <p>{new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
            </div>
          </div>

          <div className="invoice-parties">
            <div>
              <h4>Facturé à</h4>
              <p>
                {order.clientName}<br />
                {client?.email}<br />
                {client?.telephone}
              </p>
            </div>
            <div>
              <h4>Statut</h4>
              <p>{order.status}</p>
            </div>
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th className="num">Prix unitaire</th>
                <th className="num">Quantité</th>
                <th className="num">Sous-total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.productName}</td>
                  <td className="num">{formatPrice(item.prix)}</td>
                  <td className="num">{item.quantite}</td>
                  <td className="num">{formatPrice(item.subTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-totals">
            <div className="invoice-totals-row grand">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="invoice-note">
            Paiement à la livraison ou en magasin. Cette facture ne constitue pas une preuve de paiement en ligne — aucun règlement n&apos;a été effectué sur le site.
          </div>
        </div>
      </div>
    </section>
  );
}
