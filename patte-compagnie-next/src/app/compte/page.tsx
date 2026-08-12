"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loginCustomer, registerCustomer } from "@/services/clientService";
import { getOrdersByClient, Order } from "@/services/orderService";
import { getPets, deletePet, Pet } from "@/services/petService";
import { formatPrice } from "@/lib/categories";
import { speciesEmoji } from "@/lib/petData";
import PetWizard from "@/components/PetWizard";
import {
  getCustomerSession,
  setCustomerSession,
  clearCustomerSession,
  CustomerSession,
} from "@/lib/customerSession";

export default function ComptePage() {
  const [customer, setCustomer] = useState<CustomerSession | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [showWizard, setShowWizard] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [signupData, setSignupData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    dateNaissance: "",
    password: "",
  });
  const [signupError, setSignupError] = useState("");

  useEffect(() => {
    setCustomer(getCustomerSession());
  }, []);

  const refreshPets = (customerId: string) => {
    getPets(customerId).then(setPets);
  };

  useEffect(() => {
    if (customer) {
      getOrdersByClient(customer.id).then(setOrders);
      refreshPets(customer.id);
    }
  }, [customer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const c = await loginCustomer(loginData.email, loginData.password);
      const session = {
        id: c.id!, prenom: c.prenom || "", nom: c.nom, email: c.email,
        telephone: c.telephone, dateNaissance: c.dateNaissance,
      };
      setCustomerSession(session);
      setCustomer(session);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Erreur de connexion");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    try {
      const c = await registerCustomer(signupData);
      const session = {
        id: c.id!, prenom: c.prenom || "", nom: c.nom, email: c.email,
        telephone: c.telephone, dateNaissance: c.dateNaissance,
      };
      setCustomerSession(session);
      setCustomer(session);
    } catch (err) {
      setSignupError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    }
  };

  const handleLogout = () => {
    clearCustomerSession();
    setCustomer(null);
    setOrders([]);
    setPets([]);
  };

  const handleDeletePet = async (id: string) => {
    if (!confirm("Supprimer le profil de cet animal ?")) return;
    await deletePet(id);
    if (customer) refreshPets(customer.id);
  };

  return (
    <>
      <section className="account-section">
        <div className="container">
          <div className="paw-trail"><span>Mon compte</span></div>

          {customer ? (
            <div className="account-grid">
              <section className="panel">
                <div className="account-profile">
                  <div>
                    <h2>Bonjour, {customer.prenom} {customer.nom}</h2>
                    <p className="panel-sub">
                      {customer.email}
                      {customer.telephone ? ` · ${customer.telephone}` : ""}
                      {customer.dateNaissance ? ` · Né(e) le ${customer.dateNaissance}` : ""}
                    </p>
                  </div>
                  <button className="btn btn-outline btn-small" onClick={handleLogout}>Se déconnecter</button>
                </div>
              </section>

              <section className="panel">
                <h2>Mes commandes</h2>
                <p className="panel-sub">Historique des commandes passées avec ce compte.</p>
                {orders.length === 0 ? (
                  <>
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Référence</th>
                            <th>Date</th>
                            <th>Articles</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <p style={{ textAlign: "center", color: "#8b9184" }}>Vous n&apos;avez pas encore passé de commande.</p>
                  </>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Référence</th>
                          <th>Date</th>
                          <th>Articles</th>
                          <th>Total</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o.id}>
                            <td><small>#{o.id}</small></td>
                            <td>{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                            <td>{o.items.length}</td>
                            <td>{formatPrice(o.total)}</td>
                            <td><Link href={`/facture/${o.id}`} className="btn-ghost">Facture</Link></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="panel" style={{ gridColumn: "1 / -1" }}>
                {showWizard ? (
                  <PetWizard
                    customerId={customer.id}
                    onCancel={() => setShowWizard(false)}
                    onDone={() => { setShowWizard(false); refreshPets(customer.id); }}
                  />
                ) : (
                  <>
                    <h2>Mes animaux</h2>
                    <p className="panel-sub">Modifiez vos profils animaux ou créez un nouveau profil pour votre animal.</p>
                    <div className="pet-grid">
                      {pets.map((p) => (
                        <div className="pet-avatar-card" key={p.id}>
                          <button
                            className="pet-avatar-delete"
                            onClick={() => handleDeletePet(p.id!)}
                            aria-label="Supprimer"
                            type="button"
                          >
                            ✕
                          </button>
                          <div className="pet-avatar">
                            {p.photo ? (
                              <img src={p.photo} alt={p.nom} />
                            ) : (
                              <span className="pet-avatar-emoji">{speciesEmoji(p.espece)}</span>
                            )}
                          </div>
                          <span className="pet-avatar-name">{p.nom}</span>
                        </div>
                      ))}
                      <button
                        className="pet-avatar-card pet-avatar-add"
                        onClick={() => setShowWizard(true)}
                        type="button"
                      >
                        <div className="pet-avatar pet-avatar-add-icon">+</div>
                        <span className="pet-avatar-name">Ajouter un nouvel animal</span>
                      </button>
                    </div>
                  </>
                )}
              </section>
            </div>
          ) : (
            <div className="account-grid">
              <section className="panel">
                <h2>Connexion</h2>
                <p className="panel-sub">Déjà client ? Connectez-vous pour retrouver vos commandes.</p>
                <form onSubmit={handleLogin}>
                  <div className="field">
                    <label htmlFor="li-email">Email</label>
                    <input
                      type="text"
                      id="li-email"
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="li-password">Mot de passe</label>
                    <input
                      type="password"
                      id="li-password"
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Se connecter</button>
                  </div>
                  {loginError && <p className="error-msg">{loginError}</p>}
                </form>
              </section>

              <section className="panel">
                <h2>Créer un compte</h2>
                <p className="panel-sub">Créez un compte pour suivre vos commandes plus facilement.</p>
                <form onSubmit={handleSignup}>
                  <div className="field">
                    <label htmlFor="su-prenom">Prénom</label>
                    <input
                      type="text"
                      id="su-prenom"
                      required
                      value={signupData.prenom}
                      onChange={(e) => setSignupData({ ...signupData, prenom: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="su-nom">Nom</label>
                    <input
                      type="text"
                      id="su-nom"
                      required
                      value={signupData.nom}
                      onChange={(e) => setSignupData({ ...signupData, nom: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="su-email">Email</label>
                    <input
                      type="text"
                      id="su-email"
                      required
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="su-tel">Téléphone</label>
                    <input
                      type="text"
                      id="su-tel"
                      required
                      value={signupData.telephone}
                      onChange={(e) => setSignupData({ ...signupData, telephone: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="su-naissance">
                      Date de naissance <span className="hint">Optionnel</span>
                    </label>
                    <input
                      type="text"
                      id="su-naissance"
                      placeholder="JJ/MM/AAAA"
                      value={signupData.dateNaissance}
                      onChange={(e) => setSignupData({ ...signupData, dateNaissance: e.target.value })}
                    />
                    <p className="hint">(Ex. : 31/05/1970)</p>
                  </div>
                  <div className="field">
                    <label htmlFor="su-password">Mot de passe</label>
                    <input
                      type="password"
                      id="su-password"
                      required
                      minLength={4}
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Créer mon compte</button>
                  </div>
                  {signupError && <p className="error-msg">{signupError}</p>}
                </form>
              </section>
            </div>
          )}
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
